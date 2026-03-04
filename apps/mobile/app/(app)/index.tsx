import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/auth'
import { getTransactionsForMonth, calcMonthlySummary } from '@finance/core'

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function DashboardScreen() {
  const { session } = useAuth()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const [data, setData] = useState({ receitas: 0, despesas: 0, investimentos: 0 })

  useEffect(() => {
    if (!session) return
    getTransactionsForMonth(supabase as any, session.user.id, year, month).then((all) => {
      setData({
        receitas: calcMonthlySummary(all.filter((t) => t.type === 'receita')).total,
        despesas: calcMonthlySummary(all.filter((t) => t.type === 'despesa')).total,
        investimentos: calcMonthlySummary(all.filter((t) => t.type === 'investimento')).total,
      })
    })
  }, [session])

  const saldo = data.receitas - data.despesas - data.investimentos

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dashboard</Text>
      {[
        { label: 'Saldo', value: saldo, color: saldo >= 0 ? '#16a34a' : '#dc2626' },
        { label: 'Receitas', value: data.receitas, color: '#16a34a' },
        { label: 'Despesas', value: data.despesas, color: '#dc2626' },
        { label: 'Investimentos', value: data.investimentos, color: '#2563eb' },
      ].map(({ label, value, color }) => (
        <View key={label} style={styles.card}>
          <Text style={styles.cardLabel}>{label}</Text>
          <Text style={[styles.cardValue, { color }]}>{fmt(value)}</Text>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  cardLabel: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  cardValue: { fontSize: 24, fontWeight: '700' },
})
