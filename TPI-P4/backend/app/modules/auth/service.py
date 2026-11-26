from fastapi import HTTPException, status
from app.core.security import hash_password, verify_password
from app.modules.auth.schemas import UserCreate
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

class AuthService:
    """Lógica de negocio para registro y autenticación."""

    def registrar_usuario(self, datos: UserCreate) -> UserPublic:
        with UsuarioUnitOfWork() as uow:

            # Verificar que el username no esté registrado.
            if uow.usuarios.get_by_username(datos.username):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El nombre de usuario ya está registrado",
                )

            # Verificar que el email no esté registrado.
            if uow.usuarios.get_by_email(str(datos.email)):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El email ya está registrado",
                )

            # Crear el usuario con rol user.
            usuario = Usuario(
                username=datos.username,
                full_name=datos.full_name,
                email=str(datos.email),
                hashed_password=hash_password(datos.password),
                role="user",
                disabled=False,
            )

            uow.usuarios.add(usuario)

            # Preparar la respuesta sin exponer el hash.
            respuesta = UserPublic.model_validate(usuario)

        return respuesta

    def autenticar_usuario(
        self,
        username: str,
        password: str,
    ) -> Usuario:

        with UsuarioUnitOfWork() as uow:
            usuario = uow.usuarios.get_by_username(username)

            # No revelar si falló el username o la contraseña.
            if (
                usuario is None
                or not verify_password(
                    password,
                    usuario.hashed_password,
                )
            ):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Usuario o contraseña incorrectos",
                )

            # La cuenta desactivada responde 400 según la consigna.
            if usuario.disabled:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cuenta de usuario desactivada",
                )

            return usuario

    def obtener_perfil(self, usuario: Usuario) -> UserPublic:
        return UserPublic.model_validate(usuario)