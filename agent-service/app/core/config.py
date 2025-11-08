from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    JAVA_SERVICE_URL: str = "http://localhost:8080"
    MISTRAL_API_KEY: str = ""
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/provider_validation"
    MILVUS_HOST: str = "localhost"
    MILVUS_PORT: int = 19530
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
