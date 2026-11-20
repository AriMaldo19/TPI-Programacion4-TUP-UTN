/** Se llaman las rutas de categorias. */
import { api } from '../../../shared/api/axiosInstance'
import type { Categoria } from '../../productos/types'

export async function listarCategorias() {
  const { data } = await api.get<Categoria[]>('/categorias')
  return data
}

export async function crearCategoria(payload: { nombre: string; descripcion: string }) {
  const { data } = await api.post<Categoria>('/categorias', payload)
  return data
}

export async function editarCategoria(id: number, payload: { nombre: string; descripcion: string }) {
  const { data } = await api.put<Categoria>(`/categorias/${id}`, payload)
  return data
}

export async function eliminarCategoria(id: number) {
  await api.delete(`/categorias/${id}`)
}
