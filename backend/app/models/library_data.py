from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime, Boolean, Float
from sqlalchemy.orm import relationship
from app.core.database import Base
import datetime

class AnalysisReport(Base):
    __tablename__ = "analysis_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    analyst_id = Column(Integer, ForeignKey("analysts.id"), nullable=False)
    report_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    report_data = Column(JSON)
    
    analyst = relationship("Analyst", back_populates="reports")

class DataFile(Base):
    __tablename__ = "data_files"
    
    id = Column(Integer, primary_key=True, index=True)
    analyst_id = Column(Integer, ForeignKey("analysts.id"), nullable=False)
    filename = Column(String, nullable=False)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    file_path = Column(String, nullable=False)
    
    analyst = relationship("Analyst", back_populates="data_files")