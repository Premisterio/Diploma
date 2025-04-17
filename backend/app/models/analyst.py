from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Analyst(Base):  # Renamed class
    __tablename__ = "analysts"  # Updated table name

    id = Column(Integer, primary_key=True, index=True) # PK
    analyst_name = Column(String, index=True, nullable=False) # Required
    email = Column(String, unique=True, index=True, nullable=False)  # Required 
    hashed_password = Column(String, nullable=False) # Required