/** Se piden y se modifican los productos. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { actualizarStock, crearProducto, editarProducto, eliminarProducto, listarProductos } from '../api/productos'
import type { FiltrosProducto } from '../types'

// Se pide la carta al servidor.
export function useProductos(filtros: FiltrosProducto) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => listarProductos(filtros),
  })
}

// Se crea o se edita un producto y se refresca la carta.
export function useGuardarProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id?: number; payload: Parameters<typeof crearProducto>[0] }) => {
      if (input.id) return editarProducto(input.id, input.payload)
      return crearProducto(input.payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

// Se actualiza el stock y se refresca la carta.
export function useStockProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { id: number; stock: number; disponible: boolean }) => actualizarStock(input.id, input.stock, input.disponible),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

// Se da de baja el producto y se refresca la carta.
export function useEliminarProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eliminarProducto,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}
