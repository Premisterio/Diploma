from sqlalchemy import Column, Integer, String
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String)
    user_location = Column(String)
    user_device_type = Column(String)
    user_session_id = Column(String)
