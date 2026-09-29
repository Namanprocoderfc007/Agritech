from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///agriguard.db"
    
    # API Keys
    ANTHROPIC_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    
    # Ollama
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL_VISION: str = "llava"
    OLLAMA_MODEL_LLM: str = "mistral"
    
    # Weather API
    WEATHER_API_BASE: str = "https://api.open-meteo.com/v1"
    
    # Server
    DEBUG: bool = True
    PORT: int = 8000
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://localhost:3002", 
        "http://localhost:5173", 
        "http://127.0.0.1:3000", 
        "http://127.0.0.1:3002",
        "https://agriguard.vercel.app",
        "https://agriguard-ayush2004codex.vercel.app",
        "https://agriguard-git-main-ayush2004codex.vercel.app",
        "https://*.vercel.app"
    ]
    
    # AI Provider (groq, gemini, ollama)
    AI_PROVIDER: str = "groq"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra env vars

settings = Settings()
