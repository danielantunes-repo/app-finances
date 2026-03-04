'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { login, register } from './actions'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const action = mode === 'login' ? login : register
    const result = await action(formData)
    if (result?.error) setError(result.error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{mode === 'login' ? 'Entrar' : 'Criar conta'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full">
              {mode === 'login' ? 'Entrar' : 'Cadastrar'}
            </Button>
          </form>
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="mt-4 text-sm text-gray-500 hover:underline w-full text-center"
          >
            {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
