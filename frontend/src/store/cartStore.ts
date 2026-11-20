/** Se recuerda el carrito aunque se recargue la pagina. */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
}

type CartState = {
  items: CartItem[]
  agregar: (item: Omit<CartItem, 'cantidad'>) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

// Se guarda el carrito y se pueden sumar, quitar o vaciar productos.
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      agregar: (item) => {
        const actuales = get().items
        const existe = actuales.find((linea) => linea.producto_id === item.producto_id)
        if (existe) {
          set({
            items: actuales.map((linea) =>
              linea.producto_id === item.producto_id ? { ...linea, cantidad: linea.cantidad + 1 } : linea,
            ),
          })
          return
        }
        set({ items: [...actuales, { ...item, cantidad: 1 }] })
      },
      quitar: (productoId) => set({ items: get().items.filter((linea) => linea.producto_id !== productoId) }),
      cambiarCantidad: (productoId, cantidad) => {
        if (cantidad < 1) {
          get().quitar(productoId)
          return
        }
        set({
          items: get().items.map((linea) => (linea.producto_id === productoId ? { ...linea, cantidad } : linea)),
        })
      },
      vaciar: () => set({ items: [] }),
      total: () => get().items.reduce((suma, linea) => suma + linea.precio_unitario * linea.cantidad, 0),
    }),
    { name: 'foodstore-cart' },
  ),
)
