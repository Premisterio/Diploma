import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database configuration
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@db:5432/diploma")
    
    # Security
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "dev_secret_key_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",  # Local development
        "https://diploma-five-ashy.vercel.app/",  # Production frontend
    ]
    
    # File paths
    UPLOAD_DIR: str = "uploads"
    
    class Config:
        env_file = ".env"

settings = Settings()