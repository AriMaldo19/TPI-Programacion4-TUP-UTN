"""Se consultan pedidos, estados e ingresos."""

from datetime import datetime, time

from sqlalchemy.orm import selectinload
from sqlmodel import func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session) -> None:
        super().__init__(session, Pedido)

    # Se traen los pedidos de una persona, con sus lineas.
    def list_by_usuario(self, usuario_id: int) -> list[Pedido]:
        statement = (
            select(Pedido)
            .where(Pedido.usuario_id == usuario_id)
            .options(selectinload(Pedido.items))
            .order_by(Pedido.created_at.desc())
        )
        return list(self.session.exec(statement).all())

    # Se cuenta cuantos pedidos hay en un estado.
    def count_by_estado(self, estado: str) -> int:
        statement = select(func.count()).select_from(Pedido).where(Pedido.estado == estado)
        return int(self.session.exec(statement).one())

    # Se lista con paginado. El admin ve todos y el cliente solo los suyos.
    def listar(
        self,
        skip: int,
        limit: int,
        estado: str | None,
        usuario_id: int | None,
    ) -> tuple[int, list[Pedido]]:
        statement = select(Pedido)
        if usuario_id is not None:
            statement = statement.where(Pedido.usuario_id == usuario_id)
        if estado is not None:
            statement = statement.where(Pedido.estado == estado)
        total = int(self.session.exec(select(func.count()).select_from(statement.subquery())).one())
        items = self.session.exec(
            statement.options(selectinload(Pedido.items)).order_by(Pedido.created_at.desc()).offset(skip).limit(limit)
        ).all()
        return total, list(items)

    # Se busca un pedido y se traen sus lineas en la misma lectura.
    def get_con_items(self, pedido_id: int) -> Pedido | None:
        statement = select(Pedido).where(Pedido.id == pedido_id).options(selectinload(Pedido.items))
        return self.session.exec(statement).first()

    # Se cuentan los pedidos creados en el dia.
    def contar_hoy(self) -> int:
        inicio = datetime.combine(datetime.utcnow().date(), time.min)
        statement = select(func.count()).select_from(Pedido).where(Pedido.created_at >= inicio)
        return int(self.session.exec(statement).one())

    # Se suman los totales de los pedidos ya entregados.
    def ingresos_entregados(self) -> float:
        statement = select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == "ENTREGADO")
        return float(self.session.exec(statement).one())
