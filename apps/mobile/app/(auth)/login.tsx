import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { supabase } from '../../lib/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    const { error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) Alert.alert('Erro', error.message)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mode === 'login' ? 'Entrar' : 'Cadastrar'}</Text>
      <TextInput style={styles.input} placeholder="Email" value={email}
        onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Senha" value={password}
        onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
        <Text style={styles.link}>
          {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f9fafb' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12 },
  btn: { backgroundColor: '#111827', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
  link: { color: '#6b7280', textAlign: 'center', fontSize: 14 },
})
