from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base

class Analyst(Base):
    __tablename__ = "analysts"

    id = Column(Integer, primary_key=True, index=True)
    analyst_name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    reports = relationship("AnalysisReport", back_populates="analyst")
    data_files = relationship("DataFile", back_populates="analyst")
    exports = relationship("ReportExport", back_populates="analyst")