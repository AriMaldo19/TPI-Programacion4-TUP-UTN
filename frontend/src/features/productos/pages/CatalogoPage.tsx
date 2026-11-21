/** Se recorre la carta. */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listarCategorias } from '../../categorias/api/categorias'
import { useCartStore } from '../../../store/cartStore'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { ProductoCard } from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const LIMITE = 6

// Se lista la carta con busqueda, filtro y paginas.
export function CatalogoPage() {
  const [page, setPage] = useState(1)
  const [texto, setTexto] = useState('')
  const [search, setSearch] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>()
  const agregar = useCartStore((state) => state.agregar)

  const categorias = useQuery({ queryKey: ['categorias'], queryFn: listarCategorias })
  const productos = useProductos({
    skip: (page - 1) * LIMITE,
    limit: LIMITE,
    search: search || undefined,
    categoria_id: categoriaId,
  })

  const pages = Math.max(1, Math.ceil((productos.data?.total ?? 0) / LIMITE))

  return (
    <div>
      <section className="mb-8 rounded-[2rem] bg-clay px-6 py-8 text-paper sm:px-10">
        <p className="text-sm uppercase tracking-[0.2em] text-paper">Menú del día</p>
        <h1 className="mt-2 max-w-xl text-4xl sm:text-5xl">Pizzas, lomitos, papas y algo frío para tomar.</h1>
        <p className="mt-3 max-w-lg text-sm text-paper/80">Elegí del catálogo, armá el carrito y confirmá con dirección y forma de pago.</p>
      </section>
      <form
        className="mb-6 flex flex-wrap gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          setPage(1)
          setSearch(texto.trim())
        }}
      >
        <Button type="submit">Buscar</Button>
        <input
          className="min-w-56 flex-1 rounded-full border border-line bg-paper px-4 py-2"
          placeholder="Buscar por nombre"
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
        />
        <select
          className="ml-auto rounded-full border border-line bg-paper px-4 py-2"
          value={categoriaId ?? ''}
          onChange={(event) => {
            setCategoriaId(event.target.value ? Number(event.target.value) : undefined)
            setPage(1)
          }}
        >
          <option value="">Todas las categorías</option>
          {categorias.data?.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </form>
      {productos.isLoading ? <Skeleton /> : null}
      {productos.isError ? <EstadoError mensaje="No se pudo cargar el catálogo" onRetry={() => void productos.refetch()} /> : null}
      {productos.data && productos.data.items.length === 0 ? (
        <EstadoVacio titulo="Nada en el catálogo" detalle="Probá con otra búsqueda o categoría." />
      ) : null}
      {productos.data && productos.data.items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productos.data.items.map((producto) => (
            <ProductoCard
              key={producto.id}
              producto={producto}
              onAgregar={(item) => agregar({ producto_id: item.id, nombre: item.nombre, precio_unitario: item.precio_base })}
            />
          ))}
        </div>
      ) : null}
      <Paginacion page={page} pages={pages} onPage={setPage} />
    </div>
  )
}
