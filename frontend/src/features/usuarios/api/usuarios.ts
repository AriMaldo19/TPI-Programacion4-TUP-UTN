/** Se llaman las rutas de usuarios. */
import { api } from '../../../shared/api/axiosInstance'
import type { UserPublic } from '../../auth/types'

export async function listarUsuarios() {
  const { data } = await api.get<UserPublic[]>('/admin/usuarios')
  return data
}

export async function activarUsuario(id: number) {
  const { data } = await api.post<UserPublic>(`/admin/usuarios/${id}/activar`)
  return data
}

export async function desactivarUsuario(id: number) {
  const { data } = await api.post<UserPublic>(`/admin/usuarios/${id}/desactivar`)
  return data
}
