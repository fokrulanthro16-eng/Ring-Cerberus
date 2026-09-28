import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Ring Cerberus - Defensive Swarm Gateway"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # AWS Bedrock / Polly Settings
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_SESSION_TOKEN: str = ""
    MOCK_AWS: bool = True
    
    BEDROCK_VISION_MODEL_ID: str = "anthropic.claude-3-5-sonnet-20241022-v2:0"
    BEDROCK_INTERROGATOR_MODEL_ID: str = "anthropic.claude-3-5-haiku-20241022-v1:0"
    POLLY_VOICE_ID: str = "Brian"
    POLLY_ENGINE: str = "neural"
    
    # Airlock & Security
    AIRLOCK_SECRET_SEED: str = "JBSWY3DPEHPK3PXP" # Base32 compatible seed
    LOCKDOWN_PIN: str = "9941"
    
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
