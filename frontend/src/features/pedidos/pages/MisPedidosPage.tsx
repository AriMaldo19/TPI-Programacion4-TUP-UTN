/** Se consultan los pedidos propios. */
import { useState } from 'react'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { pesos } from '../../../shared/lib/money'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types'

// Se listan los pedidos de la persona.
export function MisPedidosPage() {
  const pedidos = usePedidos({ skip: 0, limit: 50 })
  const cancelar = useCancelarPedido()
  const [abierto, setAbierto] = useState<number | null>(null)

  if (pedidos.isLoading) return <p>Cargando pedidos...</p>
  if (pedidos.isError) return <EstadoError mensaje="No se pudieron cargar tus pedidos" onRetry={() => void pedidos.refetch()} />
  if (!pedidos.data || pedidos.data.items.length === 0) {
    return <EstadoVacio titulo="Todavía no pediste" detalle="Cuando confirmes un carrito, el pedido aparece acá." />
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl">Mis pedidos</h1>
      {pedidos.data.items.map((pedido) => (
        <PedidoCliente key={pedido.id} pedido={pedido} abierto={abierto === pedido.id} onToggle={() => setAbierto(abierto === pedido.id ? null : pedido.id)} onCancelar={() => void cancelar.mutateAsync(pedido.id)} />
      ))}
    </div>
  )
}

// Se muestra un pedido y, si esta pendiente, se puede cancelar.
function PedidoCliente({ pedido, abierto, onToggle, onCancelar }: { pedido: Pedido; abierto: boolean; onToggle: () => void; onCancelar: () => void }) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-ink/60">Pedido #{pedido.id}</p>
          <p className="font-display text-2xl">{pesos(pedido.total)}</p>
        </div>
        <BadgeEstado estado={pedido.estado} />
      </div>
      <p className="mt-2 text-sm">{pedido.direccion_entrega} · {pedido.forma_pago}</p>
      <div className="mt-3 flex gap-2">
        <Button variant="ghost" onClick={onToggle}>{abierto ? 'Ocultar detalle' : 'Ver detalle'}</Button>
        {pedido.estado === 'PENDIENTE' ? <Button variant="danger" onClick={onCancelar}>Cancelar</Button> : null}
      </div>
      {abierto ? (
        <ul className="mt-4 space-y-1 text-sm">
          {pedido.items.map((item) => (
            <li key={`${pedido.id}-${item.producto_id}`} className="flex justify-between">
              <span>{item.cantidad} × {item.nombre_producto}</span>
              <span>{pesos(item.subtotal)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  )
}
