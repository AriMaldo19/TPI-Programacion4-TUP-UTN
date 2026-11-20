/** Se revisa el carrito antes de comprar. */
import { Link } from 'react-router-dom'
import { pesos } from '../../../shared/lib/money'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { useCartStore } from '../../../store/cartStore'
import { useAuthStore } from '../../../store/authStore'

// Se ven las cantidades y el total del carrito.
export function CarritoPage() {
  const items = useCartStore((state) => state.items)
  const cambiarCantidad = useCartStore((state) => state.cambiarCantidad)
  const quitar = useCartStore((state) => state.quitar)
  const total = useCartStore((state) => state.total())
  const usuario = useAuthStore((state) => state.usuario)

  if (items.length === 0) {
    return <EstadoVacio titulo="El carrito está vacío" detalle="Sumá algo de la carta para armar el pedido." />
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.producto_id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <h2 className="text-xl">{item.nombre}</h2>
              <p className="text-sm text-ink/70">{pesos(item.precio_unitario)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}>-</Button>
              <span className="w-8 text-center">{item.cantidad}</span>
              <Button variant="ghost" onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}>+</Button>
              <Button variant="danger" onClick={() => quitar(item.producto_id)}>Quitar</Button>
            </div>
            <p className="font-semibold">{pesos(item.precio_unitario * item.cantidad)}</p>
          </Card>
        ))}
      </div>
      <Card className="h-fit p-5">
        <p className="text-sm text-ink/70">Total del carrito</p>
        <p className="font-display text-3xl text-clay-dark">{pesos(total)}</p>
        {usuario ? (
          <Link to="/checkout" className="mt-4 inline-flex rounded-full bg-clay px-4 py-2 text-sm font-semibold text-paper">Confirmar pedido</Link>
        ) : (
          <Link to="/login" className="mt-4 inline-flex rounded-full bg-clay px-4 py-2 text-sm font-semibold text-paper">Entrá para comprar</Link>
        )}
      </Card>
    </div>
  )
}
