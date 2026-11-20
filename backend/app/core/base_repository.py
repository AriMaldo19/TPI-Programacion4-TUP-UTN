"""Se agrupan las consultas comunes. Aca no hay reglas de negocio."""

from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    def __init__(self, session: Session, model: type[T]) -> None:
        self.session = session
        self.model = model

    # Se busca un registro por su id.
    def get_by_id(self, entity_id: int) -> T | None:
        return self.session.get(self.model, entity_id)

    # Se traen todos los registros de esa tabla.
    def get_all(self) -> list[T]:
        return list(self.session.exec(select(self.model)).all())

    # Se agrega el registro y se pide el id, sin confirmar todavia.
    def add(self, obj: T) -> T:
        self.session.add(obj)
        self.session.flush()
        self.session.refresh(obj)
        return obj

    # Se marca el registro para borrarlo dentro de la misma sesion.
    def delete(self, obj: T) -> None:
        self.session.delete(obj)
        self.session.flush()
