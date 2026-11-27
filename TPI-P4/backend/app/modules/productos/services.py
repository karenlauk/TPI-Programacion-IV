from sqlmodel import select
from app.modules.productos.models import Producto, MovimientoStock
from app.modules.productos.schemas import ( ProductoCreate, ProductoUpdate, ProductoStockUpdate, ProductoRead, ProductosPaginados, AjusteStockCreate, )
from app.modules.productos.unit_of_work import ProductoUnitOfWork

class ProductoNoEncontrado(Exception):
    """El producto no existe o está inactivo."""

class CategoriaNoEncontrada(Exception):
    """La categoría no existe o está inactiva."""

class ProductoService:
    """Implementa las reglas de negocio de productos e inventario."""

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

    def obtener_producto(
        self,
        producto_id: int,
    ) -> ProductoRead:

        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)

            if producto is None:
                raise ProductoNoEncontrado(
                    "Producto no encontrado."
                )

            return ProductoRead.model_validate(producto)

    def crear_producto(
        self,
        datos: ProductoCreate,
    ) -> ProductoRead:

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

            # Registrar el stock inicial.
            if producto.stock > 0:
                uow.session.add(
                    MovimientoStock(
                        producto_id=producto.id,
                        tipo="ENTRADA",
                        cantidad=producto.stock,
                        stock_anterior=0,
                        stock_nuevo=producto.stock,
                        motivo="Stock inicial del producto",
                    )
                )

            return ProductoRead.model_validate(producto)

    def actualizar_producto(
        self,
        producto_id: int,
        datos: ProductoUpdate,
    ) -> ProductoRead:

        with self.uow as uow:
            producto = uow.productos.get_active_by_id(
                producto_id
            )

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
            producto = uow.productos.get_active_by_id(
                producto_id
            )

            if producto is None:
                raise ProductoNoEncontrado(
                    "Producto no encontrado."
                )

            anterior = producto.stock
            diferencia = abs(datos.stock - anterior)

            if diferencia:
                uow.session.add(
                    MovimientoStock(
                        producto_id=producto.id,
                        tipo=(
                            "ENTRADA"
                            if datos.stock > anterior
                            else "SALIDA"
                        ),
                        cantidad=diferencia,
                        stock_anterior=anterior,
                        stock_nuevo=datos.stock,
                        motivo="Ajuste de inventario",
                    )
                )

            producto.stock = datos.stock
            producto.disponible = (
                datos.disponible and datos.stock > 0
            )

            producto = uow.productos.add(producto)

            return ProductoRead.model_validate(producto)

    def ajustar_stock(
        self,
        producto_id: int,
        datos: AjusteStockCreate,
    ) -> ProductoRead:

        with self.uow as uow:
            producto = uow.productos.get_by_id_for_update(
                producto_id
            )

            if producto is None or not producto.activo:
                raise ProductoNoEncontrado(
                    "Producto no encontrado."
                )

            anterior = producto.stock

            if datos.tipo == "ENTRADA":
                nuevo = anterior + datos.cantidad
            else:
                nuevo = anterior - datos.cantidad

            if nuevo < 0:
                raise ValueError(
                    "La salida supera el stock disponible."
                )

            producto.stock = nuevo

            if nuevo == 0:
                producto.disponible = False

            uow.session.add(
                MovimientoStock(
                    producto_id=producto.id,
                    tipo=datos.tipo,
                    cantidad=datos.cantidad,
                    stock_anterior=anterior,
                    stock_nuevo=nuevo,
                    motivo=datos.motivo.strip(),
                )
            )

            uow.productos.add(producto)

            return ProductoRead.model_validate(producto)

    def listar_movimientos(
        self,
        limit: int = 100,
    ) -> list[dict]:

        with self.uow as uow:
            rows = uow.session.exec(
                select(
                    MovimientoStock,
                    Producto.nombre,
                )
                .join(
                    Producto,
                    Producto.id == MovimientoStock.producto_id,
                )
                .order_by(
                    MovimientoStock.created_at.desc(),
                    MovimientoStock.id.desc(),
                )
                .limit(limit)
            ).all()

            return [
                {
                    **movimiento.model_dump(),
                    "producto_nombre": nombre,
                }
                for movimiento, nombre in rows
            ]

    def listar_stock_bajo(
        self,
        umbral: int = 5,
    ) -> list[ProductoRead]:

        with self.uow as uow:
            productos = uow.session.exec(
                select(Producto)
                .where(
                    Producto.activo.is_(True),
                    Producto.stock <= umbral,
                )
                .order_by(
                    Producto.stock,
                    Producto.nombre,
                )
            ).all()

            return [
                ProductoRead.model_validate(producto)
                for producto in productos
            ]

    def eliminar_producto(
        self,
        producto_id: int,
    ) -> None:

        with self.uow as uow:
            producto = uow.productos.get_active_by_id(
                producto_id
            )

            if producto is None:
                raise ProductoNoEncontrado(
                    "Producto no encontrado."
                )

            producto.activo = False
            uow.productos.add(producto)