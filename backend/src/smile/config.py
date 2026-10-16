"""Configuración 12-factor (RNF-POR-002). Variables: docs/sistema/arquitectura.md §7.2."""

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: Literal["development", "test", "production"] = "development"
    log_level: str = "INFO"
    tz: str = "America/Bogota"

    database_url: str = "postgresql+asyncpg://smile:smile@localhost:5432/smile"

    jwt_secret: str = "change-me-in-env"
    jwt_access_ttl_min: int = 15
    jwt_refresh_ttl_days: int = 30  # S-13
    # RF-IAM-006 y RNF-SEC-005: parámetros, no constantes.
    login_max_attempts: int = Field(default=5, gt=0)
    login_lock_minutes: int = Field(default=15, gt=0)
    login_rate_limit_per_minute: int = Field(default=10, gt=0)

    cors_origins: str = "http://localhost:3000"

    storage_provider: Literal["s3", "gcs"] = "s3"
    s3_endpoint_url: str = "http://localhost:9000"
    s3_public_endpoint_url: str = "http://localhost:9000"
    s3_access_key: str = "smile"
    s3_secret_key: str = "smile-secret"
    s3_bucket: str = "smile-files"
    s3_region: str = "us-east-1"

    smtp_host: str = "localhost"
    smtp_port: int = 1025

    outbox_poll_seconds: float = Field(default=1.0, gt=0)
    outbox_batch_size: int = Field(default=50, gt=0)
    outbox_max_attempts: int = Field(default=10, gt=0)

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
