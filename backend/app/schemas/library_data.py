from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class DataFileCreate(BaseModel):
    filename: str
    
class DataFileOut(BaseModel):
    id: int
    filename: str
    upload_date: datetime
    
    class Config:
        orm_mode = True

class AnalysisReportCreate(BaseModel):
    report_name: str
    
class AnalysisReportOut(BaseModel):
    id: int
    report_name: str
    created_at: datetime
    
    class Config:
        orm_mode = True
        
class AnalysisReportDetail(AnalysisReportOut):
    report_data: Dict[str, Any]
    
    class Config:
        orm_mode = True