import os
import logging
from typing import Annotated
from pathlib import Path

from fastapi import APIRouter, File, UploadFile, Request, HTTPException
import boto3
from botocore.exceptions import ClientError

session = boto3.session.Session()
client = session.client('s3',
                        region_name='lon1',
                        endpoint_url='https://lon1.digitaloceanspaces.com',
                        aws_access_key_id=os.getenv('SPACES_KEY'),
                        aws_secret_access_key=os.getenv('SPACES_SECRET'))


def upload_file(file_name, bucket, object_name=None) -> bool:

    # If the S3 object_name is not specified use file_name
    if object_name is None:
        object_name = os.path.basename(file_name)

    try:
        response = client.upload_file(file_name, bucket, object_name)
    except ClientError as e:
        logging.error(e)
        return False
    return True

router = APIRouter(prefix='/files', tags=['files'])


@router.post('/upload_pdf', tags=['files'])
async def upload_pdf(file: UploadFile):
    print('backend upload reached')

    if file.filename is None:
        raise HTTPException(status_code=400, detail="Missing filename")
    
    # Find upload directory and output to there
    current_folder = Path(__file__).resolve().parent.parent
    output_path = (current_folder / 'uploads') / file.filename
    
    with open(output_path, 'wb') as pdf_file:
        pdf_file.write(file.file.read())
        
    upload_file(output_path, 'contract-text-classification', f'{file.filename}')
    
    # Get presigned URL
    url = client.generate_presigned_url(
        ClientMethod='get_object',
        Params={
            'Bucket': 'contract-text-classification',
            'Key': file.filename,
            'ResponseContentType': 'text/plain'
        },
        ExpiresIn=3600
    )
    
    return {
        'Return': True,
        'filename': file.filename,
        'url': url
        }


    