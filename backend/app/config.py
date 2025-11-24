from pydantic_settings import BaseSettings
from typing import Optional, List, Union
from pydantic import field_validator
import json


class Settings(BaseSettings):
    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "unipulse"
    
    # JWT
    JWT_SECRET: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # AWS S3 (optional - for production)
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    S3_BUCKET_NAME: Optional[str] = None
    S3_REGION: str = "us-east-1"
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
    
    # CORS - can be JSON string or comma-separated string or list
    CORS_ORIGINS: Union[str, List[str]] = "*"  # Default to "*"
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            # Try to parse as JSON first
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except:
                pass
            # If it's just "*", return ["*"]
            if v.strip() == "*":
                return ["*"]
            # Split by comma if it's a comma-separated string
            if "," in v:
                return [origin.strip() for origin in v.split(",")]
            # Otherwise return as single item list
            return [v.strip()]
        return ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

