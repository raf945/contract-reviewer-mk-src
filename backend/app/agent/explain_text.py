import os
from dotenv import load_dotenv
import asyncio

import pandas as pd
from openai import AsyncOpenAI, OpenAI
from pydantic import BaseModel

from .system_prompt import system_prompt_3
from ..models.Segments import Explaination

load_dotenv()

client = AsyncOpenAI()


class ExplainText:
    
    def __init__(self):
        self.explainList: list = []


    # Add Async stuff
    async def call_llm(self, segment: str, segment_id: int, segment_label: str):
        response = await client.responses.parse(
                model='gpt-5.4',
                input=[
                    {
                        'role': 'system',
                        'content': system_prompt_3
                    },
                    {
                        'role': 'user',
                        'content': f'The Contract segment id is {segment_id}, classification of the segment is {segment_label} segment is {segment}'
                    },
                ],
                temperature=0.1,
                text_format=Explaination
            )
        self.explainList.append(response.output_parsed)


    async def explain_text(self, dataframe: pd.DataFrame) -> pd.DataFrame:
        words = 'clause'
        filtered = dataframe[dataframe['label'].str.contains(words, case=False)]
        
        # Send each to GPT
        async with asyncio.TaskGroup() as tg:
            for row, item in filtered.iterrows():
                print(f'processing {row}')
                tg.create_task(self.call_llm(item['segment'], int(row), item['label']))
                
                
        df = pd.DataFrame(columns=['explain'])
        
        for item in self.explainList:
            temp_dict = item.model_dump()
            df.loc[temp_dict['id']] = temp_dict['explain']
            
        self.explainList = 0
            
        return df.sort_index()
            
