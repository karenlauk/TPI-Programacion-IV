from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.repository import ProductoRepository

class CategoriaUnitOfWork(UnitOfWork):
    def __enter__(self) -> "CategoriaUnitOfWork":
        super().__enter__()

        if self.session is None:
            raise RuntimeError("No se pudo iniciar la sesión")

        self.categorias = CategoriaRepository(self.session)
        self.productos = ProductoRepository(self.session)

        return self