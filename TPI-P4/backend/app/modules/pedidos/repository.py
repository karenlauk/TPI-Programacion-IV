from datetime import datetime, time, timedelta, timezone, date
from zoneinfo import ZoneInfo
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select
from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido

class PedidoRepository(BaseRepository[Pedido]):
    """Consultas de persistencia específicas de pedidos."""

    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def get_by_id_with_items(
        self,
        pedido_id: int,
    ) -> Pedido | None:
        """Obtiene un pedido con sus detalles y cliente."""

        statement = (
            select(Pedido)
            .where(Pedido.id == pedido_id)
            .options(
                selectinload(Pedido.items),
                selectinload(Pedido.usuario),
            )
        )

        return self.session.exec(statement).first()

    def get_by_id_with_items_for_update(
        self,
        pedido_id: int,
    ) -> Pedido | None:
        """Obtiene y bloquea un pedido con sus relaciones."""

        statement = (
            select(Pedido)
            .where(Pedido.id == pedido_id)
            .options(
                selectinload(Pedido.items),
                selectinload(Pedido.usuario),
            )
            .with_for_update()
        )

        return self.session.exec(statement).first()

    def list_pedidos(
        self,
        skip: int = 0,
        limit: int = 20,
        usuario_id: int | None = None,
        estado: str | None = None,
    ) -> list[Pedido]:
        """Lista pedidos con sus detalles y clientes."""

        statement = (
            select(Pedido)
            .options(
                selectinload(Pedido.items),
                selectinload(Pedido.usuario),
            )
        )

        if usuario_id is not None:
            statement = statement.where(
                Pedido.usuario_id == usuario_id
            )

        if estado is not None:
            statement = statement.where(
                Pedido.estado == estado
            )

        statement = (
            statement
            .order_by(
                Pedido.created_at.desc(),
                Pedido.id.desc(),
            )
            .offset(skip)
            .limit(limit)
        )

        return list(self.session.exec(statement).all())

    def count_pedidos(
        self,
        usuario_id: int | None = None,
        estado: str | None = None,
    ) -> int:
        """Cuenta pedidos respetando los filtros."""

        statement = (
            select(func.count())
            .select_from(Pedido)
        )

        if usuario_id is not None:
            statement = statement.where(
                Pedido.usuario_id == usuario_id
            )

        if estado is not None:
            statement = statement.where(
                Pedido.estado == estado
            )

        return self.session.exec(statement).one()

    def get_resumen(self) -> dict[str, int | float]:
        """Calcula los indicadores del panel administrativo."""

        pendientes = self._count_by_estado("PENDIENTE")
        en_preparacion = self._count_by_estado("EN_PREPARACION")
        entregados = self._count_by_estado("ENTREGADO")
        cancelados = self._count_by_estado("CANCELADO")

        zona_argentina = ZoneInfo(
            "America/Argentina/Buenos_Aires"
        )

        ahora_argentina = datetime.now(zona_argentina)

        inicio_dia_argentina = datetime.combine(
            ahora_argentina.date(),
            time.min,
            tzinfo=zona_argentina,
        )

        inicio_manana_argentina = (
            inicio_dia_argentina + timedelta(days=1)
        )

        inicio_dia_utc = inicio_dia_argentina.astimezone(
            timezone.utc
        )

        inicio_manana_utc = inicio_manana_argentina.astimezone(
            timezone.utc
        )

        pedidos_hoy_statement = (
            select(func.count())
            .select_from(Pedido)
            .where(
                Pedido.created_at >= inicio_dia_utc,
                Pedido.created_at < inicio_manana_utc,
            )
        )

        pedidos_hoy = self.session.exec(
            pedidos_hoy_statement
        ).one()

        ingresos_statement = (
            select(
                func.coalesce(
                    func.sum(Pedido.total),
                    0.0,
                )
            )
            .where(
                Pedido.estado == "ENTREGADO"
            )
        )

        ingresos_entregados = self.session.exec(
            ingresos_statement
        ).one()

        return {
            "pendientes": pendientes,
            "en_preparacion": en_preparacion,
            "entregados": entregados,
            "cancelados": cancelados,
            "pedidos_hoy": pedidos_hoy,
            "ingresos_entregados": float(
                ingresos_entregados
            ),
        }

    def _count_by_estado(
        self,
        estado: str,
    ) -> int:
        """Cuenta pedidos según su estado."""

        statement = (
            select(func.count())
            .select_from(Pedido)
            .where(
                Pedido.estado == estado
            )
        )

        return self.session.exec(statement).one()