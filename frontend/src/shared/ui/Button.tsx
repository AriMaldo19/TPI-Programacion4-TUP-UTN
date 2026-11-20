/** Se reutiliza el boton de la tienda. */
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'sage' | 'ghost' | 'danger'

const styles: Record<Variant, string> = {
  primary: 'bg-clay text-paper hover:bg-clay-dark',
  sage: 'bg-sage text-paper hover:bg-ink',
  ghost: 'bg-transparent text-ink border border-line hover:bg-mist',
  danger: 'bg-clay-dark text-paper hover:bg-ink',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }

// Se dibuja un boton con el estilo de la tienda.
export function Button({ variant = 'primary', className = '', type = 'button', ...props }: Props) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  )
}
