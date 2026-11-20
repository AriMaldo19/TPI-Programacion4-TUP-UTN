/** Se entra con usuario y contraseña. */
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'

// Se pide usuario y contraseña para entrar.
export function LoginPage() {
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        await login(value.username, value.password)
        navigate('/')
      } catch (err) {
        setError(handleApiError(err))
      }
    },
  })

  return (
    <Card className="mx-auto max-w-md p-6">
      <h1 className="text-3xl">Entrar</h1>
      <p className="mt-1 text-sm text-ink/70">El acceso queda en una cookie HttpOnly. El navegador no guarda el token.</p>
      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.Field name="username" validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'Ingresá el usuario') }}>
          {(field) => (
            <Input label="Usuario" name={field.name} value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} error={field.state.meta.errors[0]} />
          )}
        </form.Field>
        <form.Field name="password" validators={{ onChange: ({ value }) => (value.length >= 8 ? undefined : 'Mínimo 8 caracteres') }}>
          {(field) => (
            <Input label="Contraseña" type="password" name={field.name} value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} error={field.state.meta.errors[0]} />
          )}
        </form.Field>
        {error ? <p className="text-sm text-clay-dark">{error}</p> : null}
        <Button type="submit" className="w-full">
          Ingresar
        </Button>
      </form>
      <p className="mt-4 text-sm">
        ¿Primera vez? <Link className="text-clay-dark underline" to="/register">Creá tu cuenta</Link>
      </p>
    </Card>
  )
}
