from pydantic import EmailStr, Field
from sqlmodel import SQLModel

class UserCreate(SQLModel):
    """Datos necesarios para registrar un usuario."""

    username: str = Field(
        min_length=1,
        strip_whitespace=True,
    )

    full_name: str = Field(
        min_length=1,
        strip_whitespace=True,
    )

    email: EmailStr

    password: str = Field(min_length=8)