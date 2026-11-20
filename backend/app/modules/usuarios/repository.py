"""Se buscan cuentas por usuario o por email."""

from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session) -> None:
        super().__init__(session, Usuario)

    # Se busca a la persona por su nombre de usuario.
    def get_by_username(self, username: str) -> Usuario | None:
        return self.session.exec(select(Usuario).where(Usuario.username == username)).first()

    # Se busca a la persona por su email.
    def get_by_email(self, email: str) -> Usuario | None:
        return self.session.exec(select(Usuario).where(Usuario.email == email)).first()
