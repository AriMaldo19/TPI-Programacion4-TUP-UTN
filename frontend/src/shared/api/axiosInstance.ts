/** Se habla con la API y se manda la cookie en cada pedido. */
import axios, { AxiosError } from 'axios'

type ErrorBody = { detail?: string | Array<{ msg?: string }> }

let clearSession: () => void = () => undefined

// Se anota como limpiar la sesion cuando la API echa a la persona.
export function registerClearSession(clear: () => void) {
  clearSession = clear
}

// Se prepara el cliente que manda la cookie en cada pedido.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

// Se cierra la sesion si el token no sirve o si la cuenta fue desactivada.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorBody>) => {
    const url = error.config?.url ?? ''
    const status = error.response?.status
    const detail = error.response?.data?.detail
    const esAuth = url.includes('/auth/token') || url.includes('/auth/me')
    const cuentaOff = status === 400 && detail === 'Cuenta de usuario desactivada'
    if ((status === 401 && !esAuth) || cuentaOff) {
      clearSession()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)
