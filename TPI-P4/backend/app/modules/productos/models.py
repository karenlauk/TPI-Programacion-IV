from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido

class Producto(SQLModel, table=True):
    """Modelo que representa un producto del catálogo."""

    __tablename__ = "producto"

    id: int | None = Field(
        default=None,
        primary_key=True,
    )

    categoria_id: int = Field(
        foreign_key="categoria.id",
        nullable=False,
    )

    nombre: str = Field(
        nullable=False,
    )

    descripcion: str

    precio_base: float = Field(
        ge=0,
        nullable=False,
    )

    imagen_url: str

    stock: int = Field(
        default=0,
        ge=0,
        nullable=False,
    )

    disponible: bool = Field(
        default=True,
        nullable=False,
    )

    activo: bool = Field(
        default=True,
        nullable=False,
    )

    categoria: "Categoria" = Relationship(
        back_populates="productos",
    )

    detalles: list["DetallePedido"] = Relationship(
        back_populates="producto",
    )

class MovimientoStock(SQLModel, table=True):
    """Registra cada variación de stock de un producto."""

    __tablename__ = "movimiento_stock"

    id: int | None = Field(
        default=None,
        primary_key=True,
    )

    producto_id: int = Field(
        foreign_key="producto.id",
        index=True,
        nullable=False,
    )

    pedido_id: int | None = Field(
        default=None,
        foreign_key="pedido.id",
        index=True,
    )

    tipo: str = Field(
        max_length=24,
        nullable=False,
    )

    cantidad: int = Field(
        gt=0,
        nullable=False,
    )

    stock_anterior: int = Field(
        ge=0,
        nullable=False,
    )

    stock_nuevo: int = Field(
        ge=0,
        nullable=False,
    )

    motivo: str = Field(
        max_length=250,
        nullable=False,
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )