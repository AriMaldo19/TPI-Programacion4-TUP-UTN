/** Se confirman la direccion y el pago. */
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { pesos } from '../../../shared/lib/money'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { useCartStore } from '../../../store/cartStore'
import { useCrearPedido } from '../hooks/usePedidos'

// Se cargan la direccion y la forma de pago para confirmar.
export function CheckoutPage() {
  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) => state.total())
  const vaciar = useCartStore((state) => state.vaciar)
  const crear = useCrearPedido()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as 'EFECTIVO' | 'TRANSFERENCIA', notas: '' },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        await crear.mutateAsync({
          items: items.map((item) => ({ producto_id: item.producto_id, cantidad: item.cantidad })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega,
          notas: value.notas,
        })
        vaciar()
        navigate('/mis-pedidos')
      } catch (err) {
        setError(handleApiError(err))
      }
    },
  })

  if (items.length === 0) {
    return <EstadoVacio titulo="No hay nada para confirmar" detalle="Volvé al catálogo y armá el carrito." />
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <Card className="p-6">
        <h1 className="text-3xl">Confirmar pedido</h1>
        <form className="mt-5 space-y-4" onSubmit={(event) => { event.preventDefault(); void form.handleSubmit() }}>
          <form.Field name="direccion_entrega" validators={{ onChange: ({ value }) => (value.trim().length >= 5 && value.trim().length <= 200 ? undefined : 'La dirección debe tener entre 5 y 200 caracteres') }}>
            {(field) => <Input label="Dirección de entrega" value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} error={field.state.meta.errors[0]} />}
          </form.Field>
          <form.Field name="forma_pago">
            {(field) => (
              <label className="block text-sm font-medium">
                Forma de pago
                <select className="mt-1 w-full rounded-2xl border border-line bg-cream px-3 py-2" value={field.state.value} onChange={(event) => field.handleChange(event.target.value as 'EFECTIVO' | 'TRANSFERENCIA')}>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
              </label>
            )}
          </form.Field>
          <form.Field name="notas">
            {(field) => <Input label="Notas (opcional)" value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} />}
          </form.Field>
          {error ? <p className="text-sm text-clay-dark">{error}</p> : null}
          <Button type="submit">Enviar pedido</Button>
        </form>
      </Card>
      <Card className="h-fit p-5">
        {items.map((item) => (
          <p key={item.producto_id} className="flex justify-between text-sm">
            <span>{item.cantidad} × {item.nombre}</span>
            <span>{pesos(item.precio_unitario * item.cantidad)}</span>
          </p>
        ))}
        <p className="mt-4 font-display text-2xl">{pesos(total)}</p>
      </Card>
    </div>
  )
}
