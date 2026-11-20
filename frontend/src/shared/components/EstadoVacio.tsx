/** Se avisa que la lista esta vacia. */
export function EstadoVacio({ titulo, detalle }: { titulo: string; detalle: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-clay/40 bg-paper px-6 py-12 text-center">
      <h2 className="text-2xl">{titulo}</h2>
      <p className="mt-2 text-sm text-ink/70">{detalle}</p>
    </div>
  )
}
