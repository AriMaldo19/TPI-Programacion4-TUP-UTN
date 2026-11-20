/** Se piden y se modifican las cuentas. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { activarUsuario, desactivarUsuario, listarUsuarios } from '../api/usuarios'

// Se piden las cuentas.
export function useUsuarios() {
  return useQuery({ queryKey: ['usuarios'], queryFn: listarUsuarios })
}

// Se vuelve a activar una cuenta.
export function useActivarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: activarUsuario,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })
}

// Se desactiva una cuenta.
export function useDesactivarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: desactivarUsuario,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })
}
