from fastapi import FastAPI
from app.api import routes, analysis_routes
from app.core.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
import os
from app.core.config import settings

# Create uploads directory
os.makedirs(os.path.join("uploads", "data_files"), exist_ok=True)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Library Data Analysis API")

# Include routers
app.include_router(routes.router, prefix="/api", tags=["auth"])
app.include_router(analysis_routes.router, prefix="/api/analysis", tags=["analysis"])

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Library Data Analysis API"}