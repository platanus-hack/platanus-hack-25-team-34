import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    # Project Settings
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Hedgie API")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    
    # Broker Settings
    BROKER_MODE: str = os.getenv("BROKER_MODE", "mock")  # 'mock' or 'real'
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # CORS Settings
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000"
    )

settings = Settings()
