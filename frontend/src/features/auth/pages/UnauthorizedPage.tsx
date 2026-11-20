/** Se explica que no hay permiso para esa pantalla. */
import { Link } from 'react-router-dom'

// Se avisa que esta seccion no corresponde al rol.
export function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-lg text-center">
      <h1 className="text-4xl">Sin permiso</h1>
      <p className="mt-3 text-ink/70">Esta sección es del panel de administración.</p>
      <Link className="mt-6 inline-block rounded-full bg-clay px-4 py-2 text-paper" to="/">
        Volver al inicio
      </Link>
    </div>
  )
}
