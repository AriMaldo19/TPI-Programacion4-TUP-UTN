"""Se busca por nombre y se listan las categorias activas."""

from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session) -> None:
        super().__init__(session, Categoria)

    # Se busca la categoria por nombre, aunque este dada de baja.
    def get_by_nombre(self, nombre: str) -> Categoria | None:
        return self.session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()

    # Se listan solo las categorias que siguen en la carta.
    def list_activas(self) -> list[Categoria]:
        statement = select(Categoria).where(Categoria.activo.is_(True)).order_by(Categoria.nombre)
        return list(self.session.exec(statement).all())
