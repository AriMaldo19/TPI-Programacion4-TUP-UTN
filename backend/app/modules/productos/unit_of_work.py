"""Se abre la sesion de productos."""

from app.core.unit_of_work import UnitOfWork
from app.modules.productos.repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    # Se abre la sesion al entrar al bloque with.
    def __enter__(self) -> "ProductoUnitOfWork":
        super().__enter__()
        self.productos = ProductoRepository(self.session)
        return self
