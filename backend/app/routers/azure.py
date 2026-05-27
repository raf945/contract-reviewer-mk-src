import os
from dotenv import load_dotenv
from typing import Final
from pathlib import Path
import pandas as pd

from fastapi import APIRouter
from pydantic import BaseModel
from azure.core.credentials import AzureKeyCredential
from azure.ai.documentintelligence import DocumentIntelligenceClient


from app.agent.classify_text import ClassifyText
from app.agent.system_prompt import data
from app.agent.explain_text_rag import ExplainText

router = APIRouter(prefix='/analyse', tags=['analyse'])

load_dotenv()

# Import azure keys
_pdi_key = os.environ.get("PDI_KEY")
_endpoint = os.environ.get("PDI_ENDPOINT")

if _pdi_key is None:
    raise ValueError("PDI_KEY environment variable not set")

if _endpoint is None:
    raise ValueError("PDI_ENDPOINT environment variable not set")

PDI_KEY: Final[str] = _pdi_key
ENDPOINT: Final[str] = _endpoint


class pdf(BaseModel):
    fileName: str
    pageNumber: int


@router.post('/azure', tags=['analyse'])
async def azure_scan(file: pdf):
    
    # Get Azure document to run through all pages by getting numPages from typescript into here again then send into explain_text_rag
    print('azure scan reached')
    
    document_intelligence = DocumentIntelligenceClient(
            endpoint=ENDPOINT, credential=AzureKeyCredential(PDI_KEY)
        )

    poller = document_intelligence.begin_analyze_document(
        "prebuilt-read", body={'urlSource': file.fileName}, pages=str(file.pageNumber)
    )

    contract = poller.result()
    paragraphs = contract.paragraphs or []
    content = [paragraph.content for paragraph in paragraphs]
    
    classify = ClassifyText()
    
    df = await classify.classify_segments(content)

    my_dict = {
        "segment": df["segment"].to_dict(),
        "label": df["label"].to_dict(),
    }

    
    # Create an instance of the ExplainTest class, then call function and append dataframe to the dataframe made in this function, match by ID.
    explain_text = ExplainText(file.fileName, ENDPOINT, PDI_KEY)
    df_explain = await explain_text.explain_text(df)
    
    #df_full = pd.concat([df, df_explain], axis=1)
    explainations = df_explain.to_dict()

    return {'Response': my_dict, 'explaination': explainations}