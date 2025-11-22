import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Project Settings
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Hedgie API")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    
    # Broker Settings
    BROKER_MODE: str = os.getenv("BROKER_MODE", "mock")  # 'mock' or 'real'
    
    # Database Settings
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://hedgie:hedgie_password@127.0.0.1:5432/hedgie"
    )
    
    # CORS Settings
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000"
    )
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
