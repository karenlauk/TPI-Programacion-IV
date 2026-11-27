from datetime import datetime
from typing import Annotated, Literal
from pydantic import ConfigDict, StringConstraints
from sqlmodel import SQLModel, Field

# ESTADOS DEL PEDIDO
EstadoPedido = Literal[
    "PENDIENTE",
    "EN_PREPARACION",
    "ENTREGADO",
    "CANCELADO",
]

# FORMAS DE PAGO
FormaPago = Literal[
    "EFECTIVO",
    "TRANSFERENCIA",
]

# VALIDACIONES DE TEXTO
DireccionEntrega = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True,
        min_length=5,
        max_length=200,
    ),
]

NotasPedido = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True,
    ),
]

# CREACIÓN DE PEDIDOS
class ItemPedidoCreate(SQLModel):
    """Producto y cantidad solicitados para el pedido."""

    producto_id: int = Field(gt=0)
    cantidad: int = Field(ge=1)

class PedidoCreate(SQLModel):
    """Datos necesarios para crear un pedido."""

    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago
    direccion_entrega: DireccionEntrega
    notas: NotasPedido | None = None

# DATOS PÚBLICOS DEL CLIENTE
class UsuarioPedidoRead(SQLModel):
    """Información del cliente asociada al pedido."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    full_name: str
    email: str

# DETALLE DE PRODUCTOS DEL PEDIDO
class DetallePedidoRead(SQLModel):
    """Datos de cada producto incluido en un pedido."""

    model_config = ConfigDict(from_attributes=True)

    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float

# RESPUESTA DE PEDIDOS
class PedidoRead(SQLModel):
    """Datos completos de un pedido."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    usuario_id: int
    usuario: UsuarioPedidoRead
    estado: EstadoPedido
    forma_pago: FormaPago
    direccion_entrega: str
    notas: str | None

    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]

# LISTADO PAGINADO
class PedidosPaginados(SQLModel):
    """Respuesta del listado paginado de pedidos."""

    total: int
    items: list[PedidoRead]

# ACTUALIZACIÓN DE ESTADO
class CambioEstado(SQLModel):
    """Estado solicitado para actualizar un pedido."""

    estado: EstadoPedido

# RESUMEN ADMINISTRATIVO
class ResumenPedidos(SQLModel):
    """Indicadores para el panel administrativo."""

    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float