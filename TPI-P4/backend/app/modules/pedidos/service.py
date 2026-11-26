from datetime import datetime, timezone
from app.modules.usuarios.models import Usuario
from app.modules.pedidos.models import Pedido, DetallePedido
from app.modules.pedidos.schemas import ( PedidoCreate,CambioEstado, PedidoRead, PedidosPaginados, ResumenPedidos, )
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork

# EXCEPCIONES DE DOMINIO
class PedidoNoEncontrado(Exception):
    pass

class PedidoAjeno(Exception):
    pass

class ProductoNoEncontrado(Exception):
    pass

class ProductoNoDisponible(Exception):
    pass

class StockInsuficiente(Exception):
    pass

class ProductoRepetido(Exception):
    pass

class TransicionInvalida(Exception):
    pass

# SERVICIO DE PEDIDOS
class PedidoService:
    """Implementa las reglas de negocio de los pedidos."""

    TRANSICIONES_VALIDAS = {
        "PENDIENTE": {
            "EN_PREPARACION",
            "CANCELADO",
        },
        "EN_PREPARACION": {
            "ENTREGADO",
            "CANCELADO",
        },
        "ENTREGADO": set(),
        "CANCELADO": set(),
    }

    def __init__(
        self,
        uow: PedidoUnitOfWork,
    ) -> None:
        self.uow = uow

    # LISTAR PEDIDOS
    def listar(
        self,
        usuario: Usuario,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> PedidosPaginados:

        with self.uow as uow:

            usuario_id = (
                None
                if usuario.role == "admin"
                else usuario.id
            )

            pedidos = uow.pedidos.list_pedidos(
                skip=skip,
                limit=limit,
                usuario_id=usuario_id,
                estado=estado,
            )

            total = uow.pedidos.count_pedidos(
                usuario_id=usuario_id,
                estado=estado,
            )

            return PedidosPaginados(
                total=total,
                items=[
                    PedidoRead.model_validate(pedido)
                    for pedido in pedidos
                ],
            )

    # OBTENER UN PEDIDO
    def obtener(
        self,
        pedido_id: int,
        usuario: Usuario,
    ) -> PedidoRead:

        with self.uow as uow:

            pedido = uow.pedidos.get_by_id_with_items(
                pedido_id
            )

            if pedido is None:
                raise PedidoNoEncontrado(
                    "Pedido no encontrado."
                )

            if (
                usuario.role != "admin"
                and pedido.usuario_id != usuario.id
            ):
                raise PedidoAjeno(
                    "El pedido pertenece a otro usuario."
                )

            return PedidoRead.model_validate(pedido)

    # CREAR PEDIDO
    def crear(
        self,
        data: PedidoCreate,
        usuario: Usuario,
    ) -> PedidoRead:

        with self.uow as uow:

            ids_productos = [
                item.producto_id
                for item in data.items
            ]

            # RN-01: no permitir productos repetidos.
            if len(ids_productos) != len(set(ids_productos)):
                raise ProductoRepetido(
                    "No se puede repetir un producto en el pedido."
                )

            pedido = Pedido(
                usuario_id=usuario.id,
                usuario=usuario,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0.0,
                items=[],
            )

            total = 0.0

            # Bloquear productos ordenados por ID para reducir
            # el riesgo de deadlocks entre compras simultáneas.
            productos = {}

            for producto_id in sorted(ids_productos):

                producto = uow.productos.get_by_id_for_update(
                    producto_id
                )

                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(
                        "El producto no existe o está inactivo."
                    )

                productos[producto_id] = producto

            # Procesar los ítems respetando el orden original.
            for item in data.items:

                producto = productos[item.producto_id]

                if not producto.disponible:
                    raise ProductoNoDisponible(
                        "El producto no está disponible."
                    )

                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        "Stock insuficiente para el producto."
                    )

                # Descontar stock.
                producto.stock -= item.cantidad
                uow.session.add(producto)

                # Utilizar el precio actual del producto.
                precio = float(producto.precio_base)

                subtotal = round(
                    precio * item.cantidad,
                    2,
                )

                detalle = DetallePedido(
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=precio,
                    subtotal=subtotal,
                )

                pedido.items.append(detalle)

                total += subtotal

            pedido.total = round(total, 2)

            pedido = uow.pedidos.add(pedido)

            return PedidoRead.model_validate(pedido)

    # ACTUALIZAR ESTADO DEL PEDIDO (ADMINISTRADOR)
    def actualizar_estado(
        self,
        pedido_id: int,
        data: CambioEstado,
    ) -> PedidoRead:

        with self.uow as uow:

            pedido = uow.pedidos.get_by_id_with_items_for_update(
                pedido_id
            )

            if pedido is None:
                raise PedidoNoEncontrado(
                    "Pedido no encontrado."
                )

            estado_actual = pedido.estado
            nuevo_estado = data.estado

            estados_permitidos = self.TRANSICIONES_VALIDAS.get(
                estado_actual,
                set(),
            )

            if nuevo_estado not in estados_permitidos:
                raise TransicionInvalida(
                    "La transición de estado no está permitida."
                )

            # RN-03: restituir stock si el administrador cancela.
            if nuevo_estado == "CANCELADO":
                self._restituir_stock(uow, pedido)

            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now(timezone.utc)

            pedido = uow.pedidos.add(pedido)

            return PedidoRead.model_validate(pedido)

    # CANCELAR PEDIDO PROPIO (CLIENTE)
    def cancelar(
        self,
        pedido_id: int,
        usuario: Usuario,
    ) -> PedidoRead:

        with self.uow as uow:

            pedido = uow.pedidos.get_by_id_with_items_for_update(
                pedido_id
            )

            if pedido is None:
                raise PedidoNoEncontrado(
                    "Pedido no encontrado."
                )

            # El endpoint de cancelación está destinado
            # exclusivamente a clientes.
            if usuario.role == "admin":
                raise TransicionInvalida(
                    "El administrador debe utilizar la gestión de estados."
                )

            # RN-04: el cliente solamente puede cancelar
            # sus propios pedidos.
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno(
                    "El pedido pertenece a otro usuario."
                )

            # RN-02 y RN-04: solamente se cancelan pedidos pendientes.
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(
                    "Solo se pueden cancelar pedidos propios pendientes."
                )

            # RN-03: restituir el stock dentro de la misma transacción.
            self._restituir_stock(uow, pedido)

            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)

            pedido = uow.pedidos.add(pedido)

            return PedidoRead.model_validate(pedido)

    # RESTITUIR STOCK DE LOS PRODUCTOS
    def _restituir_stock(
        self,
        uow: PedidoUnitOfWork,
        pedido: Pedido,
    ) -> None:

        ids_productos = sorted({
            item.producto_id
            for item in pedido.items
        })

        productos = {}

        # Bloquear los productos en orden de ID.
        for producto_id in ids_productos:

            producto = uow.productos.get_by_id_for_update(
                producto_id
            )

            if producto is None:
                raise ProductoNoEncontrado(
                    "No se encontró un producto asociado al pedido."
                )

            productos[producto_id] = producto

        # Restituir el stock de cada detalle.
        for item in pedido.items:

            producto = productos[item.producto_id]

            producto.stock += item.cantidad

            uow.session.add(producto)

    # RESUMEN ADMINISTRATIVO
    def obtener_resumen(self) -> ResumenPedidos:

        with self.uow as uow:

            resumen = uow.pedidos.get_resumen()

            return ResumenPedidos(**resumen)