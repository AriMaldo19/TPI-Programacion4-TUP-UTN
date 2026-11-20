/** Se reutiliza la ventana del panel. */
import type { ReactNode } from 'react'

type Props = { open: boolean; title: string; onClose: () => void; children: ReactNode }

// Se abre una ventana encima de la pagina.
export function Modal({ open, title, onClose, children }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl bg-paper p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-2xl text-ink">{title}</h2>
          <button type="button" className="text-sm text-clay-dark" onClick={onClose}>
            Cerrar
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
