/** Se cuida la ruta segun la sesion y el rol. */
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

type Props = { roles?: string[] }

// Se frena la ruta si no hay sesion o si el rol no alcanza.
export function ProtectedRoute({ roles }: Props) {
  const usuario = useAuthStore((state) => state.usuario)
  const cargando = useAuthStore((state) => state.cargando)

  if (cargando) {
    return <p className="py-16 text-center text-sm text-ink/70">Confirmando la sesión...</p>
  }
  if (!usuario) return <Navigate to="/login" replace />
  if (roles && !roles.includes(usuario.role)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
