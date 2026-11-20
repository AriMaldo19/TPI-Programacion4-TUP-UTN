"""Se abre la sesion que usa el modulo de usuarios."""

from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository


class UsuarioUnitOfWork(UnitOfWork):
    # Se abre la sesion al entrar al bloque with.
    def __enter__(self) -> "UsuarioUnitOfWork":
        super().__enter__()
        self.usuarios = UsuarioRepository(self.session)
        return self
