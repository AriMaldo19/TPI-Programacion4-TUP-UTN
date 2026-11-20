/** Se describe el usuario que llega desde la API. */
export type UserPublic = {
  id: number
  username: string
  full_name: string
  email: string
  role: string
  disabled: boolean
  created_at: string
}
