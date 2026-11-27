from typing import Annotated, Literal
from datetime import datetime
from pydantic import StringConstraints
from sqlmodel import SQLModel, Field
from app.modules.categorias.schemas import CategoriaRead

NombreProducto = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True,
        min_length=1,
    ),
]

class ProductoCreate(SQLModel):
    """Datos necesarios para crear un producto."""

    nombre: NombreProducto
    descripcion: str
    precio_base: float = Field(ge=0)
    imagen_url: str
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    categoria_id: int

class ProductoUpdate(SQLModel):
    """Campos que se pueden modificar parcialmente."""

    nombre: NombreProducto | None = None
    descripcion: str | None = None
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = None
    disponible: bool | None = None
    categoria_id: int | None = None

class ProductoStockUpdate(SQLModel):
    """Datos para actualizar el stock y la disponibilidad."""

    stock: int = Field(ge=0)
    disponible: bool

class ProductoRead(SQLModel):
    """Datos que devuelve la API."""

    id: int
    nombre: str
    descripcion: str
    precio_base: float
    imagen_url: str
    stock: int
    disponible: bool
    activo: bool
    categoria_id: int
    categoria: CategoriaRead

class ProductosPaginados(SQLModel):
    """Respuesta del listado paginado de productos."""

    total: int
    items: list[ProductoRead]

class AjusteStockCreate(SQLModel):
    """Datos para registrar un ajuste manual de inventario."""

    tipo: Literal["ENTRADA", "SALIDA"]
    cantidad: int = Field(gt=0)
    motivo: str = Field(
        min_length=3,
        max_length=250,
    )

class MovimientoStockRead(SQLModel):
    """Información de un movimiento de stock."""

    id: int
    producto_id: int
    pedido_id: int | None
    tipo: str
    cantidad: int
    stock_anterior: int
    stock_nuevo: int
    motivo: str
    created_at: datetime
    producto_nombre: str