import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/auth'
import { insertTransaction, CATEGORIES, CATEGORY_LABELS, transactionSchema } from '@finance/core'
import type { TransactionType } from '@finance/core'

export default function NovoScreen() {
  const { session } = useAuth()
  const router = useRouter()
  const [type, setType] = useState<TransactionType>('despesa')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringDay, setRecurringDay] = useState('')

  async function handleSave() {
    if (!session) return
    const parsed = transactionSchema.safeParse({
      type, category, description: description || null,
      amount: parseFloat(amount), date, is_recurring: isRecurring,
      recurring_day: isRecurring && recurringDay ? parseInt(recurringDay) : null,
    })
    if (!parsed.success) {
      Alert.alert('Erro', parsed.error.errors[0].message)
      return
    }
    await insertTransaction(supabase as any, session.user.id, {
      ...parsed.data,
      description: parsed.data.description ?? null,
      recurring_day: parsed.data.recurring_day ?? null,
    })
    router.back()
  }

  const categories = CATEGORIES[type]

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Novo lançamento</Text>

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.segmented}>
        {(['receita', 'despesa', 'investimento'] as TransactionType[]).map((t) => (
          <TouchableOpacity key={t} style={[styles.segment, type === t && styles.segmentActive]}
            onPress={() => { setType(t); setCategory('') }}>
            <Text style={[styles.segmentText, type === t && styles.segmentTextActive]}>
              {t === 'receita' ? 'Receita' : t === 'despesa' ? 'Despesa' : 'Invest.'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={category} onValueChange={setCategory}>
          <Picker.Item label="Selecione..." value="" />
          {categories.map((c) => <Picker.Item key={c} label={CATEGORY_LABELS[c] ?? c} value={c} />)}
        </Picker>
      </View>

      <Text style={styles.label}>Descrição</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} />

      <Text style={styles.label}>Valor (R$)</Text>
      <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" />

      <Text style={styles.label}>Data</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Recorrente</Text>
        <Switch value={isRecurring} onValueChange={setIsRecurring} />
      </View>

      {isRecurring && (
        <>
          <Text style={styles.label}>Dia do mês (1-31)</Text>
          <TextInput style={styles.input} value={recurringDay} onChangeText={setRecurringDay} keyboardType="numeric" />
        </>
      )}

      <TouchableOpacity style={styles.btn} onPress={handleSave}>
        <Text style={styles.btnText}>Salvar</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12 },
  pickerWrap: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8 },
  segmented: { flexDirection: 'row', backgroundColor: '#e5e7eb', borderRadius: 8, padding: 2 },
  segment: { flex: 1, padding: 8, alignItems: 'center', borderRadius: 6 },
  segmentActive: { backgroundColor: '#fff' },
  segmentText: { fontSize: 13, color: '#6b7280' },
  segmentTextActive: { fontWeight: '600', color: '#111827' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  btn: { backgroundColor: '#111827', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
})
