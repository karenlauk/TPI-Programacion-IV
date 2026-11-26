from fastapi import APIRouter, Depends, HTTPException, Response, status
from app.core.deps import require_role
from app.modules.categorias.schemas import ( CategoriaCreate, CategoriaRead, CategoriaUpdate, )
from app.modules.categorias.services import ( CategoriaNoEncontrada, CategoriaService, NombreDuplicado, )
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(
    prefix="/categorias",
    tags=["Categorías"],
)

def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())

@router.get(
    "",
    response_model=list[CategoriaRead],
    status_code=status.HTTP_200_OK,
)
def listar_categorias(
    service: CategoriaService = Depends(get_categoria_service),
):
    return service.listar_categorias()

@router.get(
    "/{categoria_id}",
    response_model=CategoriaRead,
    status_code=status.HTTP_200_OK,
)
def obtener_categoria(
    categoria_id: int,
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.obtener_categoria(categoria_id)

    except CategoriaNoEncontrada as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

@router.post(
    "",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
)
def crear_categoria(
    datos: CategoriaCreate,
    usuario: Usuario = Depends(require_role(["admin"])),
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.crear_categoria(datos)

    except NombreDuplicado as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        )

@router.put(
    "/{categoria_id}",
    response_model=CategoriaRead,
    status_code=status.HTTP_200_OK,
)
def actualizar_categoria(
    categoria_id: int,
    datos: CategoriaUpdate,
    usuario: Usuario = Depends(require_role(["admin"])),
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.actualizar_categoria(categoria_id, datos)

    except CategoriaNoEncontrada as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

    except NombreDuplicado as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        )

@router.delete(
    "/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_categoria(
    categoria_id: int,
    usuario: Usuario = Depends(require_role(["admin"])),
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        service.eliminar_categoria(categoria_id)

    except CategoriaNoEncontrada as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)