from typing import Literal

from pydantic import BaseModel

class Segment(BaseModel):
    segment_index: int
    label: Literal['clause', 'section_headings', 'preamble_and_parties', 'definitions', 'other', 'recitals', 'sub_headings']
    
# Use when aggregating chunks
class SegmentBatch(BaseModel):
    batch: list[Segment]
    
    
class Explaination(BaseModel):
    id: int
    explain: str
    