import { Stack, useRouter, useSegments } from 'expo-router'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from '../context/auth'

function RootLayoutNav() {
  const { session, loading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    const inApp = segments[0] === '(app)'
    if (!session && inApp) router.replace('/(auth)/login')
    if (session && !inApp) router.replace('/(app)/')
  }, [session, loading, segments])

  return <Stack screenOptions={{ headerShown: false }} />
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  )
}
