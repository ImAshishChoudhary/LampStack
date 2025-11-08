from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.api.routes import router
from app.core.config import settings
from app.core.logging import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Agent Service...")
    yield
    logger.info("Shutting down Agent Service...")

app = FastAPI(
    title="Provider Validation Agent Service",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "agent-service"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=5000,
        reload=True,
        log_level=settings.LOG_LEVEL.lower()
    )
