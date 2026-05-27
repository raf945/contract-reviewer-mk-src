import os
import hashlib
from dotenv import load_dotenv
import asyncio
import uuid
from dataclasses import dataclass

import pandas as pd
from openai import AsyncOpenAI
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from azure.core.credentials import AzureKeyCredential
from azure.ai.documentintelligence import DocumentIntelligenceClient

from .system_prompt import system_prompt_3
from ..models.Segments import Explaination

load_dotenv()

client = AsyncOpenAI()

@dataclass
class RetrievedExample:
    cosine_score: float
    text: str


class ExplainText:
    
    def __init__(self, file_name: str, endpoint, pdi_key):
        self.explainList: list = []
        self.qdrant = AsyncQdrantClient(url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY"))
        self.url_file_name = file_name
        self.file_name: str = self._sanitize_name(file_name)
        self.endpoint = endpoint
        self.pdi_key = pdi_key
        
    
    def _sanitize_name(self, url: str) -> str:
        
        return hashlib.md5(url.encode()).hexdigest()
    
    # Scan all of the doc
    def azure_scan_all(self, url_file_name: str):
        
        document_intelligence = DocumentIntelligenceClient(
                endpoint=self.endpoint, credential=AzureKeyCredential(self.pdi_key)
            )

        poller = document_intelligence.begin_analyze_document(
            "prebuilt-read", body={'urlSource': url_file_name}
        )

        contract = poller.result()
        content = [paragraph.content for paragraph in contract.paragraphs]
        
        return content
        

    # Add Async stuff
    async def call_llm(self, segment: str, segment_id: int, segment_label: str):
        
        # Retrieve context
        context = await self.retrieve_context(segment, similarity_score=0.8)
        
        # If context exists, then create it
        context_list: str = ''
        if context:
            lines = [f'- (score {item.cosine_score:.2f}) {item.text}' for item in context]
            context_list = '\n\nThe segment was similar to the following for reference:\n' + '\n'.join(lines)
        
        
        response = await client.responses.parse(
                model='gpt-5.4',
                input=[
                    {
                        'role': 'system',
                        'content': system_prompt_3
                    },
                    {
                        'role': 'user',
                        'content': (f'The Contract segment id is {segment_id},'
                                    f'classification of the segment is {segment_label}'
                                    f'segment is {segment}'
                                    f'{context_list}'
                                    )
                    },
                ],
                temperature=0.2,
                text_format=Explaination
            )
        self.explainList.append(response.output_parsed)
        
    
    # RAG embedding
    async def embed_text(self, text: list[str]) -> list[list[float]]:
        
        
        response = await client.embeddings.create(
            input=text,
            model="text-embedding-3-small"
        )
        
        # Append every embedding
        return [item.embedding for item in response.data]
    
    
    # helper embed single
    async def embed_single_text(self, text: str) -> list[float]:
        
        
        response = await client.embeddings.create(
            input=text,
            model="text-embedding-3-small"
        )
        
        # Append every embedding
        return response.data[0].embedding
    
    
    async def upsert(self, sentences: list[str], embeddings: list[list[float]]):
        # Check if collection exists of document if not create it
        collections = await self.qdrant.get_collections()
        if self.file_name not in [collection.name for collection in collections.collections]:
            await self.qdrant.create_collection(
                collection_name = self.file_name,
                vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
            )
            
        
        # Upsert
        points = [
            PointStruct(
                id=str(uuid.uuid4()),
                vector=embedding,
                payload={"text": sentence}
            )
            # loop through both lists
            for sentence, embedding in zip(sentences, embeddings)
        ]
        
        await self.qdrant.upsert(
            collection_name=self.file_name,
            points=points,
            wait=True
        )
        
    
    async def retrieve_context(self, text: str, similarity_score: float) -> list[RetrievedExample] | None:
        
        # Encode sentence
        input_embeddings = await self.embed_single_text(text)
        
        # Perform similarity search KNN
        results = await self.qdrant.query_points(
            collection_name=self.file_name,
            query=input_embeddings,
            limit=7
        )
        
        # View similarity
        if not results.points or len(results.points) < 2:
            return None
        if results.points[1].score < similarity_score:
            return None
        
        return [RetrievedExample(cosine_score=point.score, text=point.payload['text']) for point in results.points[1:]]
        


    async def explain_text(self, dataframe: pd.DataFrame) -> pd.DataFrame:
        words = 'clause'
        filtered = dataframe[dataframe['label'].str.contains(words, case=False)]
        
        segment_list: list = dataframe['segment'].tolist()
        label_list: list = dataframe['label'].tolist()
        
        # Scan through all of document only if the file name is not in collections 
        collections = await self.qdrant.get_collections()
        if self.file_name not in [c.name for c in collections.collections]:
            all_doc_sentences = self.azure_scan_all(self.url_file_name)
        
            # Embed all text
            embeddings = await self.embed_text(all_doc_sentences)
        
            # Create collection and upsert
            await self.upsert(all_doc_sentences, embeddings)
        
                
        # Send each to GPT
        async with asyncio.TaskGroup() as tg:
            for row, item in filtered.iterrows():
                print(f'processing {row}')
                tg.create_task(self.call_llm(item['segment'], int(row), item['label']))
                
                
        df = pd.DataFrame(columns=['explain'])
        
        for item in self.explainList:
            temp_dict = item.model_dump()
            df.loc[temp_dict['id']] = temp_dict['explain']
            
        self.explainList = []
            
        return df.sort_index()
            
