import os
from zoneinfo import ZoneInfo
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv()


class Settings:
    def __init__(self):
        self.IST_TIMEZONE = ZoneInfo("Asia/Kolkata")
        self.DEFAULT_TIMEZONE = self.IST_TIMEZONE

        self.APP_ENV: str = os.getenv("APP_ENV", "development")
        self.DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

        self.SECRET_KEY: str = os.getenv("SECRET_KEY", "changeme")
        self.ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
        self.ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
        self.REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

        self.DB_USER: str = os.getenv("DB_USER", "postgres")
        self.DB_PASSWORD: str = os.getenv("DB_PASSWORD", "postgres")
        self.DB_HOST: str = os.getenv("DB_HOST", "db")
        self.DB_PORT: str = os.getenv("DB_PORT", "5432")
        self.DB_NAME: str = os.getenv("DB_NAME", "feedback_db")

        self.REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/0")

        raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
        self.ALLOWED_ORIGINS: list[str] = [o.strip() for o in raw_origins.split(",")]

    @property
    def DATABASE_URL(self) -> str:
        password = quote_plus(self.DB_PASSWORD)
        return f"postgresql+asyncpg://{self.DB_USER}:{password}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def SYNC_DATABASE_URL(self) -> str:
        password = quote_plus(self.DB_PASSWORD)
        return f"postgresql://{self.DB_USER}:{password}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


settings = Settings()
