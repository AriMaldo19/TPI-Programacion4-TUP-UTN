"""Se abre la sesion de categorias."""

from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository


class CategoriaUnitOfWork(UnitOfWork):
    # Se abre la sesion al entrar al bloque with.
    def __enter__(self) -> "CategoriaUnitOfWork":
        super().__enter__()
        self.categorias = CategoriaRepository(self.session)
        return self
