"""Se guarda cada cuenta. Para darla de baja se marca disabled."""

from datetime import datetime

from sqlmodel import Field, Relationship, SQLModel


class Usuario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True, nullable=False)
    full_name: str = Field(nullable=False)
    email: str = Field(unique=True, index=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    role: str = Field(default="user", nullable=False)
    disabled: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
