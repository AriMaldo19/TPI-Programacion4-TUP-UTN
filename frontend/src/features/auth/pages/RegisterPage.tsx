/** Se crea una cuenta de cliente. */
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../../shared/api/axiosInstance'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'

// Se pide los datos para crear una cuenta de cliente.
export function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      setError('')
      try {
        await api.post('/auth/register', value)
        navigate('/login')
      } catch (err) {
        setError(handleApiError(err))
      }
    },
  })

  return (
    <Card className="mx-auto max-w-md p-6">
      <h1 className="text-3xl">Registro</h1>
      <p className="mt-1 text-sm text-ink/70">La cuenta se crea con rol de cliente.</p>
      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.Field name="username" validators={{ onChange: ({ value }) => (value.trim().length >= 3 ? undefined : 'Mínimo 3 caracteres') }}>
          {(field) => <Input label="Usuario" name={field.name} value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} error={field.state.meta.errors[0]} />}
        </form.Field>
        <form.Field name="full_name" validators={{ onChange: ({ value }) => (value.trim().length >= 2 ? undefined : 'Ingresá tu nombre') }}>
          {(field) => <Input label="Nombre completo" name={field.name} value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} error={field.state.meta.errors[0]} />}
        </form.Field>
        <form.Field name="email" validators={{ onChange: ({ value }) => (value.includes('@') ? undefined : 'Email inválido') }}>
          {(field) => <Input label="Email" type="email" name={field.name} value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} error={field.state.meta.errors[0]} />}
        </form.Field>
        <form.Field name="password" validators={{ onChange: ({ value }) => (value.length >= 8 ? undefined : 'Mínimo 8 caracteres') }}>
          {(field) => <Input label="Contraseña" type="password" name={field.name} value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} error={field.state.meta.errors[0]} />}
        </form.Field>
        {error ? <p className="text-sm text-clay-dark">{error}</p> : null}
        <Button type="submit" className="w-full">
          Crear cuenta
        </Button>
      </form>
      <p className="mt-4 text-sm">
        ¿Ya tenés cuenta? <Link className="text-clay-dark underline" to="/login">Entrá</Link>
      </p>
    </Card>
  )
}
