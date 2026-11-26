from datetime import datetime
from pydantic import ConfigDict, EmailStr, Field
from sqlmodel import SQLModel

class UserCreate(SQLModel):
    """Datos necesarios para registrar un usuario."""

    username: str = Field(min_length=1, strip_whitespace=True)
    full_name: str = Field(min_length=1, strip_whitespace=True)
    email: EmailStr
    password: str = Field(min_length=8)

class UserPublic(SQLModel):
    """Datos públicos de un usuario."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    full_name: str
    email: EmailStr
    role: str
    disabled: bool
    created_at: datetime