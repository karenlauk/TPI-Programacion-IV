from fastapi import ( APIRouter, Depends, HTTPException, Query, status, )
from app.core.deps import ( get_current_active_user, require_role, )
from app.modules.usuarios.models import Usuario
from app.modules.pedidos.schemas import ( PedidoCreate, CambioEstado, PedidoRead, PedidosPaginados, ResumenPedidos, EstadoPedido, )
from app.modules.pedidos.service import ( PedidoService, PedidoNoEncontrado, PedidoAjeno, ProductoNoEncontrado, ProductoNoDisponible, StockInsuficiente, ProductoRepetido, TransicionInvalida, )
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork

router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"],
)

def get_pedido_service() -> PedidoService:
    """Construye el servicio de pedidos."""

    return PedidoService(
        PedidoUnitOfWork()
    )

# LISTAR PEDIDOS
@router.get(
    "",
    response_model=PedidosPaginados,
    status_code=status.HTTP_200_OK,
)
def listar_pedidos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    estado: EstadoPedido | None = None,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidosPaginados:

    return service.listar(
        usuario=usuario,
        skip=skip,
        limit=limit,
        estado=estado,
    )

# CREAR PEDIDO
@router.post(
    "",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_pedido(
    data: PedidoCreate,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:

    try:
        return service.crear(data, usuario)

    except ProductoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El producto no existe o está inactivo.",
        )

    except ProductoNoDisponible:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El producto no está disponible.",
        )

    except StockInsuficiente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stock insuficiente para uno de los productos.",
        )

    except ProductoRepetido:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede repetir un producto en el pedido.",
        )

# RESUMEN ADMINISTRATIVO
@router.get(
    "/resumen",
    response_model=ResumenPedidos,
    status_code=status.HTTP_200_OK,
)
def obtener_resumen(
    usuario: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
) -> ResumenPedidos:

    return service.obtener_resumen()

# ACTUALIZAR ESTADO DEL PEDIDO (ADMINISTRADOR)
@router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoRead,
    status_code=status.HTTP_200_OK,
)
def actualizar_estado(
    pedido_id: int,
    data: CambioEstado,
    usuario: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:

    try:
        return service.actualizar_estado(
            pedido_id,
            data,
        )

    except PedidoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado.",
        )

    except ProductoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró un producto asociado al pedido.",
        )

    except TransicionInvalida:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La transición de estado solicitada no está permitida.",
        )

# CANCELAR PEDIDO PROPIO (CLIENTE)
@router.patch(
    "/{pedido_id}/cancelar",
    response_model=PedidoRead,
    status_code=status.HTTP_200_OK,
)
def cancelar_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:

    try:
        return service.cancelar(
            pedido_id,
            usuario,
        )

    except PedidoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado.",
        )

    except PedidoAjeno:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No podés cancelar un pedido de otro usuario.",
        )

    except ProductoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró un producto asociado al pedido.",
        )

    except TransicionInvalida:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden cancelar pedidos propios en estado PENDIENTE.",
        )

# OBTENER UN PEDIDO
@router.get(
    "/{pedido_id}",
    response_model=PedidoRead,
    status_code=status.HTTP_200_OK,
)
def obtener_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:

    try:
        return service.obtener(
            pedido_id,
            usuario,
        )

    except PedidoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado.",
        )

    except PedidoAjeno:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tenés permiso para consultar este pedido.",
        )