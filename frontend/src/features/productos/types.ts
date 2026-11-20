/** Se describen el producto y la categoria. */
export type Categoria = {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
}

export type Producto = {
  id: number
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
  categoria_id: number
  activo: boolean
  categoria: Categoria
}

export type ProductosPaginados = { total: number; items: Producto[] }

export type FiltrosProducto = {
  skip: number
  limit: number
  search?: string
  categoria_id?: number
  disponible?: boolean
}
