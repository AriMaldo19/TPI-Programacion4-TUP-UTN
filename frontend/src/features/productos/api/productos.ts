/** Se llaman las rutas de productos. */
import { api } from '../../../shared/api/axiosInstance'
import type { FiltrosProducto, Producto, ProductosPaginados } from '../types'

export async function listarProductos(filtros: FiltrosProducto) {
  const { data } = await api.get<ProductosPaginados>('/productos', { params: filtros })
  return data
}

export async function crearProducto(payload: {
  nombre: string
  descripcion: string
  precio_base: number
  imagen_url: string
  stock: number
  disponible: boolean
  categoria_id: number
}) {
  const { data } = await api.post<Producto>('/productos', payload)
  return data
}

export async function editarProducto(id: number, payload: {
  nombre: string
  descripcion: string
  precio_base: number
  imagen_url: string
  stock: number
  disponible: boolean
  categoria_id: number
}) {
  const { data } = await api.put<Producto>(`/productos/${id}`, payload)
  return data
}

export async function actualizarStock(id: number, stock: number, disponible: boolean) {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, { stock, disponible })
  return data
}

export async function eliminarProducto(id: number) {
  await api.delete(`/productos/${id}`)
}
