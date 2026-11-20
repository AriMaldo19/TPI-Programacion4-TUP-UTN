/** Se gestiona la carta desde el panel. */
import { useForm } from '@tanstack/react-form'
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { EstadoError } from '../../../shared/components/EstadoError'
import { handleApiError } from '../../../shared/api/handleApiError'
import { pesos } from '../../../shared/lib/money'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import { useEliminarProducto, useGuardarProducto, useProductos, useStockProducto } from '../hooks/useProductos'
import type { Producto } from '../types'

const helper = createColumnHelper<Producto>()

type FormValues = {
  nombre: string
  descripcion: string
  precio_base: number
  imagen_url: string
  stock: number
  disponible: boolean
  categoria_id: number
}

const vacio: FormValues = { nombre: '', descripcion: '', precio_base: 0, imagen_url: '', stock: 0, disponible: true, categoria_id: 0 }

// Se administran los productos, el stock y la baja.
export function AdminProductosPage() {
  const productos = useProductos({ skip: 0, limit: 100 })
  const categorias = useCategorias()
  const guardar = useGuardarProducto()
  const stock = useStockProducto()
  const eliminar = useEliminarProducto()
  const [abierto, setAbierto] = useState(false)
  const [stockDe, setStockDe] = useState<Producto | null>(null)
  const [editando, setEditando] = useState<Producto | null>(null)
  const [error, setError] = useState('')
  const [stockValor, setStockValor] = useState(0)
  const [disponible, setDisponible] = useState(true)

  const form = useForm({
    defaultValues: vacio,
    onSubmit: async ({ value }) => {
      setError('')
      try {
        await guardar.mutateAsync({
          id: editando?.id,
          payload: { ...value, imagen_url: value.imagen_url, categoria_id: Number(value.categoria_id), precio_base: Number(value.precio_base), stock: Number(value.stock) },
        })
        setAbierto(false)
      } catch (err) {
        setError(handleApiError(err))
      }
    },
  })

  const columns = useMemo(
    () => [
      helper.accessor('nombre', { header: 'Producto' }),
      helper.accessor((row) => row.categoria.nombre, { id: 'categoria', header: 'Categoría' }),
      helper.accessor('precio_base', { header: 'Precio', cell: (info) => pesos(info.getValue()) }),
      helper.accessor('stock', { header: 'Stock' }),
      helper.accessor('disponible', { header: 'Disponible', cell: (info) => (info.getValue() ? 'Sí' : 'No') }),
      helper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => { setEditando(row.original); form.setFieldValue('nombre', row.original.nombre); form.setFieldValue('descripcion', row.original.descripcion ?? ''); form.setFieldValue('precio_base', row.original.precio_base); form.setFieldValue('imagen_url', row.original.imagen_url ?? ''); form.setFieldValue('stock', row.original.stock); form.setFieldValue('disponible', row.original.disponible); form.setFieldValue('categoria_id', row.original.categoria_id); setAbierto(true) }}>Editar</Button>
            <Button variant="sage" onClick={() => { setStockDe(row.original); setStockValor(row.original.stock); setDisponible(row.original.disponible) }}>Stock</Button>
            <Button variant="danger" onClick={() => void eliminar.mutateAsync(row.original.id)}>Dar de baja</Button>
          </div>
        ),
      }),
    ],
    [eliminar, form],
  )

  const table = useReactTable({
    data: productos.data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  })

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl">Productos</h1>
        <Button onClick={() => { setEditando(null); form.reset(); setError(''); setAbierto(true) }}>Nuevo producto</Button>
      </div>
      {productos.isError ? <EstadoError mensaje="No se pudieron cargar los productos" onRetry={() => void productos.refetch()} /> : null}
      <div className="overflow-auto rounded-3xl border border-line bg-paper">
        <table className="w-full text-left text-sm">
          <thead className="bg-mist">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>{group.headers.map((header) => <th key={header.id} className="px-4 py-3">{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-line">{row.getVisibleCells().map((cell) => <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end gap-2 p-3">
          <Button variant="ghost" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Anterior</Button>
          <Button variant="ghost" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Siguiente</Button>
        </div>
      </div>
      <Modal open={abierto} title={editando ? 'Editar producto' : 'Nuevo producto'} onClose={() => setAbierto(false)}>
        <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void form.handleSubmit() }}>
          <form.Field name="nombre" validators={{ onChange: ({ value }) => (value.trim().length >= 2 ? undefined : 'Nombre requerido') }}>
            {(field) => <Input label="Nombre" value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} error={field.state.meta.errors[0]} />}
          </form.Field>
          <form.Field name="descripcion">
            {(field) => <Input label="Descripción" value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} />}
          </form.Field>
          <form.Field name="precio_base" validators={{ onChange: ({ value }) => (Number(value) >= 0 ? undefined : 'Precio inválido') }}>
            {(field) => <Input label="Precio" type="number" min={0} value={field.state.value} onChange={(event) => field.handleChange(Number(event.target.value))} error={field.state.meta.errors[0]} />}
          </form.Field>
          <form.Field name="imagen_url">
            {(field) => <Input label="URL de imagen" value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} />}
          </form.Field>
          <form.Field name="stock">
            {(field) => <Input label="Stock" type="number" min={0} value={field.state.value} onChange={(event) => field.handleChange(Number(event.target.value))} />}
          </form.Field>
          <form.Field name="categoria_id" validators={{ onChange: ({ value }) => (Number(value) > 0 ? undefined : 'Elegí una categoría') }}>
            {(field) => (
              <label className="block text-sm font-medium">
                Categoría
                <select className="mt-1 w-full rounded-2xl border border-line bg-cream px-3 py-2" value={field.state.value} onChange={(event) => field.handleChange(Number(event.target.value))}>
                  <option value={0}>Seleccionar</option>
                  {categorias.data?.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
                </select>
              </label>
            )}
          </form.Field>
          <form.Field name="disponible">
            {(field) => (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={field.state.value} onChange={(event) => field.handleChange(event.target.checked)} />
                Disponible para la venta
              </label>
            )}
          </form.Field>
          {error ? <p className="text-sm text-clay-dark">{error}</p> : null}
          <Button type="submit">Guardar</Button>
        </form>
      </Modal>
      <Modal open={stockDe !== null} title={`Stock de ${stockDe?.nombre ?? ''}`} onClose={() => setStockDe(null)}>
        <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); if (!stockDe) return; void stock.mutateAsync({ id: stockDe.id, stock: stockValor, disponible }).then(() => setStockDe(null)) }}>
          <Input label="Stock" type="number" min={0} value={stockValor} onChange={(event) => setStockValor(Number(event.target.value))} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={disponible} onChange={(event) => setDisponible(event.target.checked)} />
            Disponible
          </label>
          <Button type="submit">Actualizar stock</Button>
        </form>
      </Modal>
    </div>
  )
}
