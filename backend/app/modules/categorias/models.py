"""Se guarda cada categoria. La baja es logica, con activo en false."""

from sqlmodel import Field, Relationship, SQLModel


class Categoria(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True, nullable=False, min_length=2, max_length=100)
    descripcion: str | None = Field(default=None)
    activo: bool = Field(default=True, nullable=False)

    productos: list["Producto"] = Relationship(back_populates="categoria")
