from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.analyst import AnalystCreate, AnalystLogin, AnalystOut
from app.services.analyst import create_analyst, get_analyst_by_email, verify_password
from app.core.database import SessionLocal
from app.core.auth import create_access_token
from datetime import timedelta
from app.core.auth import get_current_analyst

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=AnalystOut)
def register(analyst: AnalystCreate, db: Session = Depends(get_db)):
    db_analyst = get_analyst_by_email(db, analyst.email)
    if db_analyst:
        raise HTTPException(status_code=400, detail="Analyst already exists")
    return create_analyst(db, analyst)

@router.post("/login")
def login(analyst: AnalystLogin, db: Session = Depends(get_db)):
    db_analyst = get_analyst_by_email(db, analyst.email)
    if not db_analyst or not verify_password(analyst.password, db_analyst.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(
        data={"sub": str(db_analyst.id)},
        expires_delta=timedelta(days=1)
    )

    return {
        "message": "Login successful",
        "token": access_token,
        "analyst_id": db_analyst.id,
        "email": db_analyst.email
    }

@router.get("/secure-endpoint")
def secure_stuff(current_user=Depends(get_current_analyst)):
    return {
        "message": "You are authenticated",
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.analyst_name
        }
    }
