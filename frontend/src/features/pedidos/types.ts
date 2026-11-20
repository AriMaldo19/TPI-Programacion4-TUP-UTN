/** Se describen el pedido, sus lineas y el resumen. */
export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO'

export type DetallePedido = {
  producto_id: number
  nombre_producto: string
  precio_unitario: number
  cantidad: number
  subtotal: number
}

export type Pedido = {
  id: number
  usuario_id: number
  estado: EstadoPedido
  forma_pago: 'EFECTIVO' | 'TRANSFERENCIA'
  direccion_entrega: string
  notas: string | null
  total: number
  created_at: string
  updated_at: string
  items: DetallePedido[]
}

export type PedidosPaginados = { total: number; items: Pedido[] }

export type ResumenPedidos = {
  pendientes: number
  en_preparacion: number
  entregados: number
  cancelados: number
  pedidos_hoy: number
  ingresos_entregados: number
}
