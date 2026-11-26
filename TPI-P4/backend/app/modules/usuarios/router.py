from fastapi import APIRouter, Depends, status
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService

router = APIRouter(
    prefix="/admin/usuarios",
    tags=["Usuarios"],
)

def get_usuario_service() -> UsuarioService:
    return UsuarioService()

@router.get(
    "",
    response_model=list[UserPublic],
    status_code=status.HTTP_200_OK,
)
def listar_usuarios(
    _: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
):
    return service.listar_usuarios()

@router.post(
    "/{usuario_id}/activar",
    response_model=UserPublic,
    status_code=status.HTTP_200_OK,
)
def activar_usuario(
    usuario_id: int,
    _: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
):
    return service.activar_usuario(usuario_id)

@router.post(
    "/{usuario_id}/desactivar",
    response_model=UserPublic,
    status_code=status.HTTP_200_OK,
)
def desactivar_usuario(
    usuario_id: int,
    administrador: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
):
    return service.desactivar_usuario(
        usuario_id,
        administrador.id,
    )