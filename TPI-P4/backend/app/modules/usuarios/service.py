from fastapi import HTTPException, status
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

class UsuarioService:
    """Lógica de negocio para la administración de usuarios."""

    def listar_usuarios(self) -> list[UserPublic]:
        with UsuarioUnitOfWork() as uow:
            usuarios = uow.usuarios.get_all_users()

            respuesta = [
                UserPublic.model_validate(usuario)
                for usuario in usuarios
            ]

        return respuesta

    def activar_usuario(self, usuario_id: int) -> UserPublic:
        with UsuarioUnitOfWork() as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)

            if usuario is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuario no encontrado",
                )

            if usuario.disabled:
                usuario.disabled = False
                uow.session.add(usuario)
                uow.session.flush()

            respuesta = UserPublic.model_validate(usuario)

        return respuesta

    def desactivar_usuario(
        self,
        usuario_id: int,
        administrador_id: int | None,
    ) -> UserPublic:
        with UsuarioUnitOfWork() as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)

            if usuario is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuario no encontrado",
                )

            if usuario_id == administrador_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No puede desactivar su propia cuenta",
                )

            if not usuario.disabled:
                usuario.disabled = True
                uow.session.add(usuario)
                uow.session.flush()

            respuesta = UserPublic.model_validate(usuario)

        return respuesta