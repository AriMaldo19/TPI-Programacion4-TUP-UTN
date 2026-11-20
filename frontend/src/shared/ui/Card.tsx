/** Se reutiliza la tarjeta de la tienda. */
import type { ReactNode } from 'react'

// Se dibuja una tarjeta.
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <article className={`rounded-3xl border border-line bg-paper shadow-sm ${className}`}>{children}</article>
}
