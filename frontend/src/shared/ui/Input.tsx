/** Se reutiliza el campo de los formularios. */
import type { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }

// Se dibuja un campo con su etiqueta y, si hace falta, el error.
export function Input({ label, error, id, className = '', ...props }: Props) {
  const inputId = id ?? props.name
  return (
    <label className="block text-sm font-medium text-ink" htmlFor={inputId}>
      {label}
      <input
        id={inputId}
        className={`mt-1 w-full rounded-2xl border border-line bg-cream px-3 py-2 outline-none ring-clay focus:ring-2 ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-clay-dark">{error}</span> : null}
    </label>
  )
}
