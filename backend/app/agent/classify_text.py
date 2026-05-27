import pandas as pd
import asyncio
import numpy as np

from openai import AsyncOpenAI

from app.models.Segments import Segment, SegmentBatch
from .system_prompt import system_prompt_2


client = AsyncOpenAI()

class ClassifyText:
    
    def __init__(self):
        self.class_list: list = []
        

    async def call_llm(self, segments_text: str, system_prompt: str):
        response = await client.responses.parse(
                model="gpt-5.4-mini",
                input=[
                    {
                        'role': 'system',
                        'content': system_prompt
                    },
                    {
                        'role': 'user',
                        'content': f"Contract segments: |n{segments_text}"
                    }
                    ],
                    temperature=0,
                    text_format= Segment
            )
        self.class_list.append(response.output_parsed)


    async def classify_segments(self, segment_list: list[str]):
        data_series = pd.Series(segment_list, name='segment')
        print('HEAD OF INPUT')
        print(data_series.head(10))
        print('')
        
        # Store output in dict
        aggregated_dict: dict = {}
        batch_size = 5
        
        # Loop through dataset
        async with asyncio.TaskGroup() as tg:
            for idx, text in data_series.items():
                segments_text = f'- segment_id: {idx} \n text: {text}'
                tg.create_task(self.call_llm(segments_text, system_prompt_2))
                
                
        # Dump pydantic model into df
        pred_df = pd.DataFrame(columns=['label'])
        
        for item in self.class_list:
            temp_dict = item.model_dump()
            pred_df.loc[temp_dict['segment_index']] = temp_dict['label']
            
        full_df = pd.concat([data_series, pred_df], axis=1)
        
        print('HEAD OF OUTPUT')
        print(full_df.head(10))
        print('')
        
        
        """
        for batch in dict_output['batch']:
            aggregated_dict[batch['segment_index']] = batch['label']
            
        # Store predicted in df   
        pred_df = pd.DataFrame({'predicted': aggregated_dict})
        full_df = pd.concat([data_series, pred_df], axis=1)
        """
        
        return full_df
            
