from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from app.core.deps import require_role
from app.modules.productos.schemas import ( ProductoCreate, ProductoUpdate, ProductoStockUpdate, ProductoRead, ProductosPaginados, )
from app.modules.productos.services import ( ProductoService, ProductoNoEncontrado, CategoriaNoEncontrada, )
from app.modules.productos.unit_of_work import ProductoUnitOfWork

router = APIRouter(
    prefix="/productos",
    tags=["Productos"],
)

def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())

@router.get(
    "",
    response_model=ProductosPaginados,
    status_code=status.HTTP_200_OK,
)
def listar_productos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    categoria_id: int | None = Query(default=None, ge=1),
    disponible: bool | None = Query(default=None),
    service: ProductoService = Depends(get_producto_service),
):
    return service.listar_productos(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )

@router.get(
    "/{producto_id}",
    response_model=ProductoRead,
    status_code=status.HTTP_200_OK,
)
def obtener_producto(
    producto_id: int,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.obtener_producto(producto_id)
    except ProductoNoEncontrado as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

@router.post(
    "",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(["admin"]))],
)
def crear_producto(
    datos: ProductoCreate,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.crear_producto(datos)
    except CategoriaNoEncontrada as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

@router.put(
    "/{producto_id}",
    response_model=ProductoRead,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar_producto(
    producto_id: int,
    datos: ProductoUpdate,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.actualizar_producto(producto_id, datos)
    except ProductoNoEncontrado as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )
    except CategoriaNoEncontrada as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

@router.patch(
    "/{producto_id}/stock",
    response_model=ProductoRead,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar_stock(
    producto_id: int,
    datos: ProductoStockUpdate,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.actualizar_stock(producto_id, datos)
    except ProductoNoEncontrado as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role(["admin"]))],
)
def eliminar_producto(
    producto_id: int,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        service.eliminar_producto(producto_id)
    except ProductoNoEncontrado as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)