"""Se busca en la carta por nombre, categoria y disponibilidad."""

from sqlalchemy.orm import selectinload
from sqlmodel import func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session) -> None:
        super().__init__(session, Producto)

    # Se filtra la carta por nombre, categoria y si esta disponible.
    def search(
        self,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> tuple[int, list[Producto]]:
        statement = select(Producto).where(Producto.activo.is_(True))
        if search:
            statement = statement.where(Producto.nombre.ilike(f"%{search.strip()}%"))
        if categoria_id is not None:
            statement = statement.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            statement = statement.where(Producto.disponible.is_(disponible))

        total = self.session.exec(select(func.count()).select_from(statement.subquery())).one()
        items = self.session.exec(
            statement.options(selectinload(Producto.categoria)).order_by(Producto.nombre).offset(skip).limit(limit)
        ).all()
        return int(total), list(items)

    # Se trae el producto solo si sigue activo, junto con su categoria.
    def get_activo(self, producto_id: int) -> Producto | None:
        statement = (
            select(Producto)
            .where(Producto.id == producto_id, Producto.activo.is_(True))
            .options(selectinload(Producto.categoria))
        )
        return self.session.exec(statement).first()
