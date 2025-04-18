from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.analyst import AnalystCreate, AnalystLogin, AnalystOut
from app.services.analyst import create_analyst, get_analyst_by_email, verify_password
from app.core.database import SessionLocal
from datetime import timedelta
from app.core.auth import get_current_analyst, create_refresh_token
from app.core.auth import create_access_token, oauth2_scheme, SECRET_KEY, ALGORITHM
from jose import JWTError, jwt

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

    access_token = create_access_token({"sub": str(db_analyst.id)})
    refresh_token = create_refresh_token({"sub": str(db_analyst.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
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

@router.post("/refresh")
def refresh_token(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        analyst_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid refresh token")

    access_token = create_access_token({"sub": analyst_id})
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
