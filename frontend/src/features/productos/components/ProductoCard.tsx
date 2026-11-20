/** Se presenta un producto de la carta. */
import { pesos } from '../../../shared/lib/money'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import type { Producto } from '../types'

type Props = { producto: Producto; onAgregar: (producto: Producto) => void }

// Se muestra el producto y se lo puede sumar al carrito.
export function ProductoCard({ producto, onAgregar }: Props) {
  const agotado = !producto.disponible || producto.stock < 1
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="relative h-40 bg-mist">
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre} className="h-full w-full object-contain" />
        ) : null}
        <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-3 py-1 text-xs font-semibold text-sage">
          {producto.categoria.nombre}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-xl">{producto.nombre}</h3>
        <p className="mt-1 flex-1 text-sm text-ink/70">{producto.descripcion}</p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-clay-dark">{pesos(producto.precio_base)}</p>
            <p className="text-xs text-ink/60">{agotado ? 'Sin stock' : `${producto.stock} en cocina`}</p>
          </div>
          <Button disabled={agotado} onClick={() => onAgregar(producto)}>
            Agregar al carrito
          </Button>
        </div>
      </div>
    </Card>
  )
}
