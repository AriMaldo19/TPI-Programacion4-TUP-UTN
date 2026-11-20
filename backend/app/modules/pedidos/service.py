"""Se aplican las reglas del pedido: stock, estados y cancelacion."""

from datetime import datetime

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario

# Se define a donde puede pasar cada estado. Los finales no se mueven.
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ProductoNoEncontrado(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class TransicionInvalida(Exception):
    pass


class PedidoService:
    @property
    def uow(self) -> PedidoUnitOfWork:
        return PedidoUnitOfWork()

    # Se arma el pedido, se descuenta el stock y se copian nombre y precio de cada producto.
    def crear(self, data: PedidoCreate, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("El pedido tiene productos repetidos")

            ahora = datetime.utcnow()
            pedido = Pedido(
                usuario_id=usuario.id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega.strip(),
                notas=data.notas,
                total=0,
                created_at=ahora,
                updated_at=ahora,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado("Producto inexistente o inactivo")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"{producto.nombre} no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(f"Stock insuficiente para {producto.nombre}")
                # Se descuenta el stock en la misma operacion que crea el pedido.
                producto.stock -= item.cantidad
                uow.session.add(producto)
                subtotal = round(producto.precio_base * item.cantidad, 2)
                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                pedido.items.append(detalle)
                total += subtotal

            pedido.total = round(total, 2)
            pedido.updated_at = datetime.utcnow()
            uow.session.flush()
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    # Se listan los pedidos propios, o todos si quien mira es admin.
    def listar(
        self,
        usuario: Usuario,
        skip: int,
        limit: int,
        estado: str | None,
    ) -> PedidosPaginados:
        with self.uow as uow:
            usuario_id = None if usuario.role == "admin" else usuario.id
            total, items = uow.pedidos.listar(skip, limit, estado, usuario_id)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(item) for item in items])

    # Se muestra el pedido si es de la persona o si la mira un admin.
    def obtener(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._visible(uow, pedido_id, usuario)
            return PedidoRead.model_validate(pedido)

    # Se avanza o se cancela el pedido segun los estados permitidos.
    def cambiar_estado(self, pedido_id: int, data: CambioEstado) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_con_items(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado")
            self._aplicar_transicion(uow, pedido, data.estado)
            return PedidoRead.model_validate(pedido)

    # Se cancela un pedido propio, y solo si todavia esta pendiente.
    def cancelar_propio(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_con_items(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado")
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("No podés cancelar un pedido de otro usuario")
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida("Solo se puede cancelar un pedido pendiente")
            self._aplicar_transicion(uow, pedido, "CANCELADO")
            return PedidoRead.model_validate(pedido)

    # Se arman los numeros que ve el panel.
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado("PENDIENTE"),
                en_preparacion=uow.pedidos.count_by_estado("EN_PREPARACION"),
                entregados=uow.pedidos.count_by_estado("ENTREGADO"),
                cancelados=uow.pedidos.count_by_estado("CANCELADO"),
                pedidos_hoy=uow.pedidos.contar_hoy(),
                ingresos_entregados=round(uow.pedidos.ingresos_entregados(), 2),
            )

    # Se niega el pedido de otra persona con un 403.
    def _visible(self, uow: PedidoUnitOfWork, pedido_id: int, usuario: Usuario) -> Pedido:
        pedido = uow.pedidos.get_con_items(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        if usuario.role != "admin" and pedido.usuario_id != usuario.id:
            raise PedidoAjeno("No podés ver un pedido de otro usuario")
        return pedido

    # Se valida el cambio de estado y, si es una cancelacion, se devuelve el stock.
    def _aplicar_transicion(self, uow: PedidoUnitOfWork, pedido: Pedido, destino: str) -> None:
        permitidos = TRANSICIONES.get(pedido.estado, set())
        if destino not in permitidos:
            raise TransicionInvalida("Transición de estado inválida")
        if destino == "CANCELADO":
            for linea in pedido.items:
                producto = uow.productos.get_by_id(linea.producto_id)
                if producto is not None:
                    # Se devuelve el stock de cada linea al cancelar.
                    producto.stock += linea.cantidad
                    uow.session.add(producto)
        pedido.estado = destino
        pedido.updated_at = datetime.utcnow()
        uow.session.add(pedido)
        uow.session.flush()
        uow.session.refresh(pedido)
