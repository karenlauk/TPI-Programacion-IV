from sqlalchemy import func
from sqlmodel import Session, select
from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto

class ProductoRepository(BaseRepository[Producto]):
    """Consultas de persistencia específicas de productos."""

    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def get_all_active(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> list[Producto]:
        statement = select(Producto).where(
            Producto.activo.is_(True)
        )

        if search and search.strip():
            statement = statement.where(
                Producto.nombre.ilike(f"%{search.strip()}%")
            )

        if categoria_id is not None:
            statement = statement.where(
                Producto.categoria_id == categoria_id
            )

        if disponible is not None:
            statement = statement.where(
                Producto.disponible == disponible
            )

        statement = (
            statement
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        )

        return list(self.session.exec(statement).all())

    def count_active(
        self,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> int:
        statement = (
            select(func.count())
            .select_from(Producto)
            .where(Producto.activo.is_(True))
        )

        if search and search.strip():
            statement = statement.where(
                Producto.nombre.ilike(f"%{search.strip()}%")
            )

        if categoria_id is not None:
            statement = statement.where(
                Producto.categoria_id == categoria_id
            )

        if disponible is not None:
            statement = statement.where(
                Producto.disponible == disponible
            )

        return self.session.exec(statement).one()

    def get_active_by_id(
        self,
        producto_id: int,
    ) -> Producto | None:
        statement = select(Producto).where(
            Producto.id == producto_id,
            Producto.activo.is_(True),
        )

        return self.session.exec(statement).first()

    def get_by_id_for_update(
        self,
        producto_id: int,
    ) -> Producto | None:
        """Obtiene un producto bloqueando su fila durante la transacción."""

        statement = (
            select(Producto)
            .where(Producto.id == producto_id)
            .with_for_update()
        )

        return self.session.exec(statement).first()

    def get_by_categoria_id(
        self,
        categoria_id: int,
    ) -> list[Producto]:
        """
        Obtiene todos los productos asociados a una categoría,
        tanto activos como inactivos.
        """

        statement = select(Producto).where(
            Producto.categoria_id == categoria_id
        )

        return list(self.session.exec(statement).all())