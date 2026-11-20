/** Se lee el mensaje de error que mando la API. */
import axios from 'axios'

// Se convierte el error de la API en una frase para la pantalla.
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail: unknown = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (item && typeof item === 'object' && 'msg' in item && typeof item.msg === 'string') {
            return item.msg
          }
          return 'Dato inválido'
        })
        .join('. ')
    }
  }
  return 'Ocurrió un error inesperado'
}
