/** Se gestionan las cuentas desde el panel. */
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo } from 'react'
import type { UserPublic } from '../../auth/types'
import { Button } from '../../../shared/ui/Button'
import { useAuthStore } from '../../../store/authStore'
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from '../hooks/useUsuarios'

const helper = createColumnHelper<UserPublic>()

// Se listan las cuentas y se las activa o desactiva.
export function AdminUsuariosPage() {
  const usuarios = useUsuarios()
  const activar = useActivarUsuario()
  const desactivar = useDesactivarUsuario()
  const sesionId = useAuthStore((state) => state.usuario?.id)

  const columns = useMemo(
    () => [
      helper.accessor('username', { header: 'Usuario' }),
      helper.accessor('full_name', { header: 'Nombre' }),
      helper.accessor('email', { header: 'Email' }),
      helper.accessor('role', { header: 'Rol' }),
      helper.accessor('disabled', { header: 'Estado', cell: (info) => (info.getValue() ? 'Desactivado' : 'Activo') }),
      helper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="sage" onClick={() => void activar.mutateAsync(row.original.id)}>Activar</Button>
            {row.original.id !== sesionId ? (
              <Button variant="danger" onClick={() => void desactivar.mutateAsync(row.original.id)}>Desactivar</Button>
            ) : null}
          </div>
        ),
      }),
    ],
    [activar, desactivar, sesionId],
  )

  const table = useReactTable({
    data: usuarios.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  })

  return (
    <div>
      <h1 className="mb-4 text-3xl">Usuarios</h1>
      <div className="overflow-auto rounded-3xl border border-line bg-paper">
        <table className="w-full text-left text-sm">
          <thead className="bg-mist">{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id} className="px-4 py-3">{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-line">{row.getVisibleCells().map((cell) => <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
