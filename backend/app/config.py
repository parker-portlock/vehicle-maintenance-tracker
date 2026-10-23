from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/maintenance"
    s3_bucket: str = ""
    s3_region: str = "us-east-1"
    cors_origins: str = "http://localhost:5173,http://localhost:8000"

    model_config = {"env_file": ".env"}

    @property
    def allowed_origins(self) -> list[str]:
        # If cors_origins is set to "*", allow all origins (for development only)
        if self.cors_origins == "*":
            return ["*"]
        
        # For production, we might want to be more restrictive
        # But for development, we'll allow common ports
        origins = [o.strip() for o in self.cors_origins.split(",")]
        
        # Also add common development origins if not already present
        common_origins = ["http://localhost:5173", "http://localhost:8000"]
        for origin in common_origins:
            if origin not in origins:
                origins.append(origin)
                
        return origins


settings = Settings()
