"""Se abre la sesion y, al salir, se confirma o se deshace todo junto."""

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    def __init__(self) -> None:
        self.session: Session | None = None

    # Se abre la sesion al entrar al bloque with.
    def __enter__(self) -> "UnitOfWork":
        self.session = session_factory()
        return self

    # Se confirma si salio bien y se deshace todo si hubo un error.
    def __exit__(self, exc_type, exc, tb) -> None:
        if self.session is None:
            return
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
