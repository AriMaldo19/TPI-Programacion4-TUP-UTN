"""Se guardan el pedido y sus lineas, con el precio copiado en cada una."""

from datetime import datetime

from sqlmodel import Field, Relationship, SQLModel


class Pedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", nullable=False, index=True)
    estado: str = Field(default="PENDIENTE", nullable=False, index=True)
    forma_pago: str = Field(nullable=False)
    direccion_entrega: str = Field(nullable=False)
    notas: str | None = Field(default=None)
    total: float = Field(default=0, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    usuario: "Usuario" = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", nullable=False, index=True)
    producto_id: int = Field(foreign_key="producto.id", nullable=False)
    cantidad: int = Field(nullable=False, ge=1)
    nombre_producto: str = Field(nullable=False)
    precio_unitario: float = Field(nullable=False)
    subtotal: float = Field(nullable=False)

    pedido: Pedido = Relationship(back_populates="items")
    producto: "Producto" = Relationship(back_populates="detalles")
