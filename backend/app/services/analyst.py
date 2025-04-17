import secrets
from sqlalchemy.orm import Session
from app.models.analyst import Analyst
from app.schemas.analyst import AnalystCreate
from passlib.context import CryptContext
from typing import Optional


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_analyst(db: Session, analyst: AnalystCreate):
    hashed_pw = pwd_context.hash(analyst.password)
    db_analyst = Analyst(
        analyst_name=analyst.analyst_name,
        email=analyst.email,
        hashed_password=hashed_pw
    )
    db.add(db_analyst)
    db.commit()
    db.refresh(db_analyst)
    return db_analyst

def get_analyst_by_email(db: Session, email: str) -> Optional[Analyst]:
    return db.query(Analyst).filter(Analyst.email == email).first()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
