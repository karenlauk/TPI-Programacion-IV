from pydantic import EmailStr, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # BASE DE DATOS
    DATABASE_URL: str

    # JWT Y SEGURIDAD
    SECRET_KEY: str = Field(min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, gt=0)

    # CORS
    FRONTEND_ORIGIN: str

    # ADMINISTRADOR INICIAL
    ADMIN_USERNAME: str = "admin"
    ADMIN_EMAIL: EmailStr
    ADMIN_PASSWORD: str = Field(min_length=1)
    ADMIN_NOMBRE: str = "Administrador"
    ADMIN_APELLIDO: str = "FoodStore"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()