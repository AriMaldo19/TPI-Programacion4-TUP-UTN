"""Se prepara la conexion a la base y la forma de abrir sesiones."""

from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)


# Se importan los modelos y se crean las tablas que falten.
def create_all_tables() -> None:
    import app.modules.categorias.models  # noqa: F401
    import app.modules.pedidos.models  # noqa: F401
    import app.modules.productos.models  # noqa: F401
    import app.modules.usuarios.models  # noqa: F401

    SQLModel.metadata.create_all(engine)


# Se abre una sesion nueva de la base.
def session_factory() -> Session:
    return Session(engine)


# Se presta una sesion para login y usuarios, y se cierra al terminar.
def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
