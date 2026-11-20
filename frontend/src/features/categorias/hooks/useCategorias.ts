/** Se piden y se modifican las categorias. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { crearCategoria, editarCategoria, eliminarCategoria, listarCategorias } from '../api/categorias'

// Se piden las categorias.
export function useCategorias() {
  return useQuery({ queryKey: ['categorias'], queryFn: listarCategorias })
}

// Se crea o se edita una categoria.
export function useGuardarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { id?: number; nombre: string; descripcion: string }) => {
      const payload = { nombre: input.nombre, descripcion: input.descripcion }
      return input.id ? editarCategoria(input.id, payload) : crearCategoria(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categorias'] })
    },
  })
}

// Se da de baja una categoria.
export function useEliminarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eliminarCategoria,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categorias'] })
    },
  })
}
