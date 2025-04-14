from fastapi import FastAPI
from app.api import routes
from app.core.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(routes.router)
