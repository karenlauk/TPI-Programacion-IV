from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.config import settings
from app.core.deps import get_current_active_user
from app.core.security import create_access_token
from app.modules.auth.schemas import UserCreate
from app.modules.auth.service import AuthService
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"],
)

def get_auth_service() -> AuthService:
    return AuthService()

@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
)
def registrar_usuario(
    datos: UserCreate,
    service: AuthService = Depends(get_auth_service),
):
    """Registra un usuario nuevo con rol user."""

    return service.registrar_usuario(datos)

@router.post(
    "/token",
    status_code=status.HTTP_200_OK,
)
def iniciar_sesion(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
):
    """Valida las credenciales y establece la cookie JWT."""

    usuario = service.autenticar_usuario(
        username=form_data.username,
        password=form_data.password,
    )

    access_token = create_access_token(
        subject=usuario.username,
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    return {"message": "Login exitoso"}

@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
)
def cerrar_sesion(response: Response):
    """Elimina la cookie de autenticación."""

    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=False,
        samesite="lax",
        path="/",
    )

    return {"message": "Sesión cerrada correctamente"}

@router.get(
    "/me",
    response_model=UserPublic,
    status_code=status.HTTP_200_OK,
)
def obtener_usuario_actual(
    usuario: Usuario = Depends(get_current_active_user),
    service: AuthService = Depends(get_auth_service),
):
    """Devuelve los datos públicos del usuario autenticado."""

    return service.obtener_perfil(usuario)