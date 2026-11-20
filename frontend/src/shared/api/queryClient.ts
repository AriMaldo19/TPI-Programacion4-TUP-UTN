/** Se comparte una sola cache entre las pantallas. */
import { QueryClient } from '@tanstack/react-query'

// Se crea la cache comun de las consultas.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})
