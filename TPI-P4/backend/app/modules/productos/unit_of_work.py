from app.core.unit_of_work import UnitOfWork
from app.modules.productos.repository import ProductoRepository
from app.modules.categorias.repository import CategoriaRepository

class ProductoUnitOfWork(UnitOfWork):
    """Coordina las operaciones de productos y categorías."""

    def __enter__(self) -> "ProductoUnitOfWork":
        super().__enter__()

        if self.session is None:
            raise RuntimeError("No se pudo iniciar la sesión.")

        self.productos = ProductoRepository(self.session)
        self.categorias = CategoriaRepository(self.session)

        return self