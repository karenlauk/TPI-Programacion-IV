from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy import DateTime
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.usuarios.models import Usuario
    from app.modules.productos.models import Producto

def ahora_utc() -> datetime:
    """Devuelve la fecha y hora actual en UTC."""
    return datetime.now(timezone.utc)

class Pedido(SQLModel, table=True):
    """Modelo que representa un pedido realizado por un usuario."""

    __tablename__ = "pedido"

    id: int | None = Field(
        default=None,
        primary_key=True,
    )

    usuario_id: int = Field(
        foreign_key="usuarios.id",
        nullable=False,
        index=True,
    )

    estado: str = Field(
        default="PENDIENTE",
        nullable=False,
    )

    forma_pago: str = Field(
        max_length=13,
        nullable=False,
    )

    direccion_entrega: str = Field(
        min_length=5,
        max_length=200,
        nullable=False,
    )

    notas: str | None = Field(
        default=None,
    )

    total: float = Field(
        default=0.0,
        ge=0,
        nullable=False,
    )

    created_at: datetime = Field(
        default_factory=ahora_utc,
        sa_type=DateTime(timezone=True),
        nullable=False,
    )

    updated_at: datetime = Field(
        default_factory=ahora_utc,
        sa_type=DateTime(timezone=True),
        nullable=False,
    )

    usuario: "Usuario" = Relationship(
        back_populates="pedidos",
    )

    items: list["DetallePedido"] = Relationship(
        back_populates="pedido",
    )


class DetallePedido(SQLModel, table=True):
    """Modelo que representa cada producto incluido en un pedido."""

    __tablename__ = "detalle_pedido"

    id: int | None = Field(
        default=None,
        primary_key=True,
    )

    pedido_id: int = Field(
        foreign_key="pedido.id",
        nullable=False,
    )

    producto_id: int = Field(
        foreign_key="producto.id",
        nullable=False,
    )

    cantidad: int = Field(
        ge=1,
        nullable=False,
    )

    nombre_producto: str = Field(
        nullable=False,
    )

    precio_unitario: float = Field(
        ge=0,
        nullable=False,
    )

    subtotal: float = Field(
        ge=0,
        nullable=False,
    )

    pedido: Pedido = Relationship(
        back_populates="items",
    )

    producto: "Producto" = Relationship(
        back_populates="detalles",
    )