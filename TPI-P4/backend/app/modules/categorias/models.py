from typing import TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.productos.models import Producto

class Categoria(SQLModel, table=True):
    """Modelo que representa una categoría de productos."""

    __tablename__ = "categoria"

    id: int | None = Field(default=None, primary_key=True)

    nombre: str = Field(
        min_length=2,
        max_length=100,
        unique=True,
        index=True,
        nullable=False,
    )

    descripcion: str

    activo: bool = Field(default=True, nullable=False)

    productos: list["Producto"] = Relationship(
        back_populates="categoria",
    )