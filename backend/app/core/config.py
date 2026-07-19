from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )

    # ==========================
    # APP
    # ==========================

    APP_NAME: str = "Multi-Agent AI Backend"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"

    # ==========================
    # SECURITY
    # ==========================

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ==========================
    # SUPABASE
    # ==========================

    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # ==========================
    # LLM
    # ==========================

    LLM_PROVIDER: str = "gemini"

    # ==========================
    # GEMINI
    # ==========================

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-pro"

    # ==========================
    # IBM WATSONX
    # ==========================

    WATSONX_API_KEY: str = ""
    WATSONX_PROJECT_ID: str = ""
    WATSONX_URL: str = "https://us-south.ml.cloud.ibm.com"

    # ==========================
    # CORS
    # ==========================

    ALLOWED_ORIGINS: str = "http://localhost:5173"

    @property
    def cors_origins(self):
        return [
            origin.strip()
            for origin in self.ALLOWED_ORIGINS.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()