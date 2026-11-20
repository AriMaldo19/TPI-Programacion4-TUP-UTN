/** Se piden y se modifican los pedidos. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cambiarEstado, cancelarPedido, crearPedido, listarPedidos, obtenerResumen } from '../api/pedidos'
import type { EstadoPedido } from '../types'

// Se piden los pedidos.
export function usePedidos(filtros: { skip: number; limit: number; estado?: string }) {
  return useQuery({ queryKey: ['pedidos', filtros], queryFn: () => listarPedidos(filtros) })
}

// Se confirma el pedido y se actualizan la carta y los pedidos.
export function useCrearPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: crearPedido,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      await queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

// Se cancela el pedido y se vuelve a pedir el stock.
export function useCancelarPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelarPedido,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      await queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

// Se cambia el estado desde el panel.
export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { id: number; estado: EstadoPedido }) => cambiarEstado(input.id, input.estado),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      await queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

// Se piden los numeros del resumen.
export function useResumenPedidos() {
  return useQuery({ queryKey: ['pedidos', 'resumen'], queryFn: obtenerResumen })
}
