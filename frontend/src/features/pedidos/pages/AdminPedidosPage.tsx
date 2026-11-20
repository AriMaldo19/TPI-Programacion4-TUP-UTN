/** Se gestionan los pedidos del negocio. */
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { pesos } from '../../../shared/lib/money'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import type { EstadoPedido, Pedido } from '../types'

const helper = createColumnHelper<Pedido>()
const transiciones: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
}

// Se ven todos los pedidos y se los hace avanzar o cancelar.
export function AdminPedidosPage() {
  const [estado, setEstado] = useState<string>('')
  const pedidos = usePedidos({ skip: 0, limit: 100, estado: estado || undefined })
  const cambiar = useCambiarEstadoPedido()

  const columns = useMemo(
    () => [
      helper.accessor('id', { header: '#' }),
      helper.accessor('usuario_id', { header: 'Cliente' }),
      helper.accessor('estado', { header: 'Estado', cell: (info) => <BadgeEstado estado={info.getValue()} /> }),
      helper.accessor('forma_pago', { header: 'Pago' }),
      helper.accessor('direccion_entrega', { header: 'Dirección' }),
      helper.accessor('total', { header: 'Total', cell: (info) => pesos(info.getValue()) }),
      helper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {transiciones[row.original.estado].map((destino) => (
              <Button key={destino} variant={destino === 'CANCELADO' ? 'danger' : 'sage'} onClick={() => void cambiar.mutateAsync({ id: row.original.id, estado: destino })}>
                {destino === 'CANCELADO' ? 'Cancelar' : destino.replaceAll('_', ' ')}
              </Button>
            ))}
          </div>
        ),
      }),
    ],
    [cambiar],
  )

  const table = useReactTable({
    data: pedidos.data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  })

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Pedidos</h1>
        <select className="rounded-full border border-line bg-paper px-4 py-2" value={estado} onChange={(event) => setEstado(event.target.value)}>
          <option value="">Todos</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PREPARACION">En preparación</option>
          <option value="ENTREGADO">Entregado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>
      <div className="overflow-auto rounded-3xl border border-line bg-paper">
        <table className="w-full text-left text-sm">
          <thead className="bg-mist">{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id} className="px-4 py-3">{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead>
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
    </div>
  )
}
