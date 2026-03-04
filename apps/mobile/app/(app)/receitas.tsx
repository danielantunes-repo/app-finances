import { useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/auth'
import { getTransactionsByType, calcMonthlySummary, deleteTransaction, CATEGORY_LABELS } from '@finance/core'
import type { Transaction } from '@finance/core'

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ReceitasScreen() {
  const { session } = useAuth()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const load = useCallback(async () => {
    if (!session) return
    const data = await getTransactionsByType(supabase as any, session.user.id, 'receita', year, month)
    setTransactions(data)
  }, [session])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const summary = calcMonthlySummary(transactions)

  async function handleDelete(id: string) {
    Alert.alert('Confirmar', 'Excluir lançamento?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        await deleteTransaction(supabase as any, id)
        load()
      }},
    ])
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receitas</Text>
      <View style={styles.cardsRow}>
        <View style={styles.card}><Text style={styles.cardLabel}>Total</Text><Text style={styles.cardValue}>{fmt(summary.total)}</Text></View>
        <View style={styles.card}><Text style={styles.cardLabel}>Registros</Text><Text style={styles.cardValue}>{String(summary.count)}</Text></View>
      </View>
      <FlatList
        data={transactions}
        keyExtractor={(t) => t.id}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum lançamento.</Text>}
        renderItem={({ item: t }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowDesc}>{t.description ?? CATEGORY_LABELS[t.category]}</Text>
              <Text style={styles.rowMeta}>{CATEGORY_LABELS[t.category] ?? t.category} · {t.display_date ?? t.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.rowAmount}>{fmt(t.amount)}</Text>
              <TouchableOpacity onPress={() => handleDelete(t.id)}>
                <Text style={styles.deleteBtn}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 2 },
  cardLabel: { fontSize: 12, color: '#6b7280' },
  cardValue: { fontSize: 20, fontWeight: '700' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 32 },
  row: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8, flexDirection: 'row' },
  rowDesc: { fontWeight: '600', fontSize: 14 },
  rowMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  rowAmount: { fontWeight: '700', fontSize: 15 },
  deleteBtn: { fontSize: 12, color: '#ef4444', marginTop: 4 },
})
