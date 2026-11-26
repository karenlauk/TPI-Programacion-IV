from collections.abc import Callable
from fastapi import Cookie, Depends, HTTPException, status
from sqlmodel import Session, select
from app.core.database import get_session
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario

def get_current_user(
    access_token: str | None = Cookie(default=None),
    session: Session = Depends(get_session),
) -> Usuario:
    """Obtiene el usuario autenticado a partir de la cookie JWT."""

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado o sesión inválida",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not access_token:
        raise credentials_exception

    payload = decode_access_token(access_token)

    if not payload:
        raise credentials_exception

    username = payload.get("sub")

    if not username:
        raise credentials_exception

    statement = select(Usuario).where(Usuario.username == username)
    usuario = session.exec(statement).first()

    if usuario is None:
        raise credentials_exception

    return usuario

def get_current_active_user(
    current_user: Usuario = Depends(get_current_user),
) -> Usuario:
    """Rechaza usuarios que tengan la cuenta desactivada."""

    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )

    return current_user

def require_role(
    allowed_roles: list[str],
) -> Callable:
    """Restringe el acceso a los roles indicados."""

    def role_checker(
        current_user: Usuario = Depends(get_current_active_user),
    ) -> Usuario:

        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para realizar esta operación",
            )

        return current_user

    return role_checker