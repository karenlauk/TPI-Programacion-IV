from app.modules.productos.models import Producto
from app.modules.productos.schemas import ( ProductoCreate, ProductoUpdate, ProductoStockUpdate, ProductoRead, ProductosPaginados, )
from app.modules.productos.unit_of_work import ProductoUnitOfWork

class ProductoNoEncontrado(Exception):
    """El producto no existe o está inactivo."""

class CategoriaNoEncontrada(Exception):
    """La categoría no existe o está inactiva."""

class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def listar_productos(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            productos = uow.productos.get_all_active(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )

            total = uow.productos.count_active(
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )

            items = [
                ProductoRead.model_validate(producto)
                for producto in productos
            ]

            return ProductosPaginados(
                total=total,
                items=items,
            )

    def obtener_producto(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)

            if producto is None:
                raise ProductoNoEncontrado(
                    "Producto no encontrado."
                )

            return ProductoRead.model_validate(producto)

    def crear_producto(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(
                datos.categoria_id
            )

            if categoria is None:
                raise CategoriaNoEncontrada(
                    "La categoría no existe o está inactiva."
                )

            producto = Producto(
                **datos.model_dump(),
                activo=True,
                categoria=categoria,
            )

            producto = uow.productos.add(producto)

            return ProductoRead.model_validate(producto)

    def actualizar_producto(
        self,
        producto_id: int,
        datos: ProductoUpdate,
    ) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)

            if producto is None:
                raise ProductoNoEncontrado(
                    "Producto no encontrado."
                )

            cambios = datos.model_dump(
                exclude_unset=True,
                exclude_none=True,
            )

            if "categoria_id" in cambios:
                categoria = uow.categorias.get_active_by_id(
                    cambios.pop("categoria_id")
                )

                if categoria is None:
                    raise CategoriaNoEncontrada(
                        "La categoría no existe o está inactiva."
                    )

                producto.categoria = categoria

            producto.sqlmodel_update(cambios)
            producto = uow.productos.add(producto)

            return ProductoRead.model_validate(producto)

    def actualizar_stock(
        self,
        producto_id: int,
        datos: ProductoStockUpdate,
    ) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)

            if producto is None:
                raise ProductoNoEncontrado(
                    "Producto no encontrado."
                )

            producto.stock = datos.stock
            producto.disponible = datos.disponible

            producto = uow.productos.add(producto)

            return ProductoRead.model_validate(producto)

    def eliminar_producto(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)

            if producto is None:
                raise ProductoNoEncontrado(
                    "Producto no encontrado."
                )

            producto.activo = False
            uow.productos.add(producto)