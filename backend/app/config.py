from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/maintenance"
    s3_bucket: str = ""
    s3_region: str = "us-east-1"
    cors_origins: str = "http://localhost:5173"

    model_config = {"env_file": ".env"}

    @property
    def allowed_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


settings = Settings()
