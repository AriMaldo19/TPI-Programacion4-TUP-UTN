/** Se avisa que la carga fallo. */
import { Button } from '../ui/Button'

// Se avisa el error y se ofrece reintentar.
export function EstadoError({ mensaje, onRetry }: { mensaje: string; onRetry?: () => void }) {
  return (
    <div className="rounded-3xl bg-clay/10 px-6 py-8 text-center">
      <p className="font-medium text-clay-dark">{mensaje}</p>
      {onRetry ? (
        <Button className="mt-4" variant="ghost" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  )
}
