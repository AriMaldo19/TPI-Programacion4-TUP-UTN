/** Se arma la barra de arriba. */
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'

const enlace = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-1 text-sm ${isActive ? 'bg-clay text-paper' : 'text-ink hover:bg-mist'}`

// Se muestra el menu, el carrito y quien esta logueado.
export function Navbar() {
  const usuario = useAuthStore((state) => state.usuario)
  const logout = useAuthStore((state) => state.logout)
  const cantidad = useCartStore((state) => state.items.reduce((suma, item) => suma + item.cantidad, 0))
  const navigate = useNavigate()

  async function cerrar() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-clay font-display text-lg text-paper">FS</span>
          <span className="font-display text-xl leading-none">Food Store</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          <NavLink to="/" className={enlace} end>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={enlace}>
            Carrito ({cantidad})
          </NavLink>
          {usuario ? (
            <NavLink to="/mis-pedidos" className={enlace}>
              Mis pedidos
            </NavLink>
          ) : null}
          {usuario?.role === 'admin' ? (
            <NavLink to="/admin/resumen" className={enlace}>
              Panel
            </NavLink>
          ) : null}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          {usuario ? (
            <>
              <span>
                {usuario.full_name} · <strong className="text-sage">{usuario.role}</strong>
              </span>
              <button type="button" className="rounded-full border border-line px-3 py-1" onClick={() => void cerrar()}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-3 py-1 hover:bg-mist">
                Entrar
              </Link>
              <Link to="/register" className="rounded-full bg-clay px-3 py-1 text-paper">
                Registro
              </Link>
            </>
          )}
        </div>
      </div>
      {usuario?.role === 'admin' ? (
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 pb-3">
          <NavLink to="/admin/resumen" className={enlace}>
            Resumen
          </NavLink>
          <NavLink to="/admin/categorias" className={enlace}>
            Categorías
          </NavLink>
          <NavLink to="/admin/productos" className={enlace}>
            Productos
          </NavLink>
          <NavLink to="/admin/pedidos" className={enlace}>
            Pedidos
          </NavLink>
          <NavLink to="/admin/usuarios" className={enlace}>
            Usuarios
          </NavLink>
        </div>
      ) : null}
    </header>
  )
}
