/** Se reutilizan los controles de pagina. */
import { Button } from '../ui/Button'

type Props = { page: number; pages: number; onPage: (page: number) => void }

// Se pasa a la pagina anterior o a la siguiente.
export function Paginacion({ page, pages, onPage }: Props) {
  if (pages <= 1) return null
  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <Button variant="ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Anterior
      </Button>
      <span className="text-sm">
        Página {page} de {pages}
      </span>
      <Button variant="ghost" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Siguiente
      </Button>
    </div>
  )
}
