/** Se llaman las rutas de pedidos. */
import { api } from '../../../shared/api/axiosInstance'
import type { EstadoPedido, Pedido, PedidosPaginados, ResumenPedidos } from '../types'

export async function listarPedidos(params: { skip: number; limit: number; estado?: string }) {
  const { data } = await api.get<PedidosPaginados>('/pedidos', { params })
  return data
}

export async function crearPedido(payload: {
  items: { producto_id: number; cantidad: number }[]
  forma_pago: 'EFECTIVO' | 'TRANSFERENCIA'
  direccion_entrega: string
  notas: string
}) {
  const { data } = await api.post<Pedido>('/pedidos', payload)
  return data
}

export async function cancelarPedido(id: number) {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/cancelar`)
  return data
}

export async function cambiarEstado(id: number, estado: EstadoPedido) {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado })
  return data
}

export async function obtenerResumen() {
  const { data } = await api.get<ResumenPedidos>('/pedidos/resumen')
  return data
}
