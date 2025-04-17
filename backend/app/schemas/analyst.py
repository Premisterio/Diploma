from pydantic import BaseModel, EmailStr

class AnalystCreate(BaseModel):
    analyst_name: str  
    email: EmailStr
    password: str

class AnalystLogin(BaseModel):
    email: EmailStr
    password: str

class AnalystOut(BaseModel):
    id: int
    email: EmailStr

    class Config:
        orm_mode = True
