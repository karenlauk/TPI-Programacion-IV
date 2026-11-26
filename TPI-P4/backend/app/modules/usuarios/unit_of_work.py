from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository

class UsuarioUnitOfWork(UnitOfWork):
    """Unit of Work del módulo de usuarios."""

    def __enter__(self) -> "UsuarioUnitOfWork":
        super().__enter__()

        if self.session is None:
            raise RuntimeError("No se pudo iniciar la sesión")

        self.usuarios = UsuarioRepository(self.session)

        return self