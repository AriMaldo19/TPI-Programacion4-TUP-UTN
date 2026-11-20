/** Se reutiliza la etiqueta de estado. */
const colores: Record<string, string> = {
  PENDIENTE: 'bg-gold/30 text-clay-dark',
  EN_PREPARACION: 'bg-clay/15 text-clay-dark',
  ENTREGADO: 'bg-clay text-paper',
  CANCELADO: 'bg-ink/10 text-ink',
}

// Se pinta el estado del pedido.
export function BadgeEstado({ estado }: { estado: string }) {
  const texto = estado.replaceAll('_', ' ')
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${colores[estado] ?? 'bg-mist'}`}>{texto}</span>
}
