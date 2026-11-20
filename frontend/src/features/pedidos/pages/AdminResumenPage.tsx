/** Se mira el resumen del negocio. */
import { Card } from '../../../shared/ui/Card'
import { EstadoError } from '../../../shared/components/EstadoError'
import { pesos } from '../../../shared/lib/money'
import { useResumenPedidos } from '../hooks/usePedidos'

// Se muestran las tarjetas del negocio.
export function AdminResumenPage() {
  const resumen = useResumenPedidos()
  if (resumen.isLoading) return <p>Cargando resumen...</p>
  if (resumen.isError || !resumen.data) return <EstadoError mensaje="No se pudo cargar el resumen" onRetry={() => void resumen.refetch()} />
  const tarjetas = [
    ['Pendientes', String(resumen.data.pendientes)],
    ['En preparación', String(resumen.data.en_preparacion)],
    ['Entregados', String(resumen.data.entregados)],
    ['Cancelados', String(resumen.data.cancelados)],
    ['Pedidos de hoy', String(resumen.data.pedidos_hoy)],
    ['Ingresos entregados', pesos(resumen.data.ingresos_entregados)],
  ]
  return (
    <div>
      <h1 className="mb-6 text-3xl">Resumen del negocio</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tarjetas.map(([titulo, valor]) => (
          <Card key={titulo} className="bg-gradient-to-br from-paper to-mist p-5">
            <p className="text-sm uppercase tracking-wide text-sage">{titulo}</p>
            <p className="mt-2 font-display text-3xl text-clay-dark">{valor}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
