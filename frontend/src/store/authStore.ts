/** Se recuerda quien entro, sin guardar el token. */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, registerClearSession } from '../shared/api/axiosInstance'
import type { UserPublic } from '../features/auth/types'

export type UsuarioSesion = {
  id: number
  username: string
  full_name: string
  email: string
  role: string
}

type AuthState = {
  usuario: UsuarioSesion | null
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

// Se queda con los datos visibles de la persona, sin el token.
function aSesion(user: UserPublic): UsuarioSesion {
  return {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
  }
}

// Se guarda la sesion en el navegador y se ofrecen entrar, salir y revisarla.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      // Se entra con el formulario y despues se pide el perfil.
      login: async (username, password) => {
        const body = new URLSearchParams()
        body.set('username', username)
        body.set('password', password)
        await api.post('/auth/token', body, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        const { data } = await api.get<UserPublic>('/auth/me')
        set({ usuario: aSesion(data), cargando: false })
      },
      // Se avisa a la API y se olvida a la persona en el navegador.
      logout: async () => {
        await api.post('/auth/logout')
        set({ usuario: null })
      },
      // Se pregunta a la API si la cookie sigue viva.
      checkSession: async () => {
        set({ cargando: true })
        try {
          const { data } = await api.get<UserPublic>('/auth/me')
          set({ usuario: aSesion(data), cargando: false })
        } catch {
          set({ usuario: null, cargando: false })
        }
      },
    }),
    {
      name: 'foodstore-auth',
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)

registerClearSession(() => useAuthStore.setState({ usuario: null }))
