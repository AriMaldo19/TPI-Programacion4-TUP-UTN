/** Se gestionan las categorias desde el panel. */
import { useForm } from '@tanstack/react-form'
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import type { Categoria } from '../../productos/types'
import { useCategorias, useEliminarCategoria, useGuardarCategoria } from '../hooks/useCategorias'

const columnas = createColumnHelper<Categoria>()

// Se administran las categorias.
export function AdminCategoriasPage() {
  const categorias = useCategorias()
  const guardar = useGuardarCategoria()
  const eliminar = useEliminarCategoria()
  const [abierto, setAbierto] = useState(false)
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [error, setError] = useState('')

  const form = useForm({
    defaultValues: { nombre: '', descripcion: '' },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        await guardar.mutateAsync({ id: editando?.id, nombre: value.nombre, descripcion: value.descripcion })
        setAbierto(false)
      } catch (err) {
        setError(handleApiError(err))
      }
    },
  })

  const columns = useMemo(
    () => [
      columnas.accessor('nombre', { header: 'Nombre' }),
      columnas.accessor('descripcion', { header: 'Descripción', cell: (info) => info.getValue() || '—' }),
      columnas.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setEditando(row.original)
                form.setFieldValue('nombre', row.original.nombre)
                form.setFieldValue('descripcion', row.original.descripcion ?? '')
                setAbierto(true)
              }}
            >
              Editar
            </Button>
            <Button variant="danger" onClick={() => void eliminar.mutateAsync(row.original.id)}>
              Dar de baja
            </Button>
          </div>
        ),
      }),
    ],
    [eliminar, form],
  )

  const table = useReactTable({
    data: categorias.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  })

  function abrirNueva() {
    setEditando(null)
    form.reset()
    setError('')
    setAbierto(true)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl">Categorías</h1>
        <Button onClick={abrirNueva}>Nueva categoría</Button>
      </div>
      {categorias.isLoading ? <p>Cargando...</p> : null}
      {categorias.isError ? <EstadoError mensaje="No se pudieron cargar las categorías" onRetry={() => void categorias.refetch()} /> : null}
      {categorias.data && categorias.data.length === 0 ? <EstadoVacio titulo="Sin categorías" detalle="Creá la primera para armar la carta." /> : null}
      {categorias.data && categorias.data.length > 0 ? (
        <div className="overflow-auto rounded-3xl border border-line bg-paper">
          <table className="w-full text-left text-sm">
            <thead className="bg-mist">
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id}>
                  {group.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3">{flexRender(header.column.columnDef.header, header.getContext())}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-line">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end gap-2 p-3">
            <Button variant="ghost" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Anterior</Button>
            <Button variant="ghost" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Siguiente</Button>
          </div>
        </div>
      ) : null}
      <Modal open={abierto} title={editando ? 'Editar categoría' : 'Nueva categoría'} onClose={() => setAbierto(false)}>
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void form.handleSubmit() }}>
          <form.Field name="nombre" validators={{ onChange: ({ value }) => (value.trim().length >= 2 ? undefined : 'Entre 2 y 100 caracteres') }}>
            {(field) => <Input label="Nombre" name={field.name} value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} error={field.state.meta.errors[0]} />}
          </form.Field>
          <form.Field name="descripcion">
            {(field) => <Input label="Descripción" name={field.name} value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} />}
          </form.Field>
          {error ? <p className="text-sm text-clay-dark">{error}</p> : null}
          <Button type="submit">Guardar</Button>
        </form>
      </Modal>
    </div>
  )
}
