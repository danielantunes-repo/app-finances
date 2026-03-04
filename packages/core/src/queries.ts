import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './supabase'
import type { Transaction, TransactionInsert, TransactionUpdate, MonthlySummary, TransactionType } from './types'

export function buildMonthRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`
  return { start, end }
}

export function projectRecurringTransaction(t: Transaction, year: number, month: number): Transaction {
  if (t.is_recurring && t.recurring_day) {
    const day = String(t.recurring_day).padStart(2, '0')
    const monthStr = String(month).padStart(2, '0')
    return { ...t, display_date: `${year}-${monthStr}-${day}` }
  }
  return { ...t, display_date: t.date }
}

export async function getTransactionsForMonth(
  supabase: SupabaseClient<Database>,
  userId: string,
  year: number,
  month: number
): Promise<Transaction[]> {
  const { start, end } = buildMonthRange(year, month)

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .or(`and(is_recurring.eq.false,date.gte.${start},date.lt.${end}),is_recurring.eq.true`)
    .order('date', { ascending: false })

  if (error) throw error
  return (data ?? []).map((t) => projectRecurringTransaction(t as Transaction, year, month))
}

export async function getTransactionsByType(
  supabase: SupabaseClient<Database>,
  userId: string,
  type: TransactionType,
  year: number,
  month: number
): Promise<Transaction[]> {
  const all = await getTransactionsForMonth(supabase, userId, year, month)
  return all.filter((t) => t.type === type)
}

export function calcMonthlySummary(transactions: Transaction[]): MonthlySummary {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0)
  const largest = transactions.reduce((max, t) => Math.max(max, t.amount), 0)
  return { total, count: transactions.length, largest }
}

export async function insertTransaction(
  supabase: SupabaseClient<Database>,
  userId: string,
  data: TransactionInsert
): Promise<Transaction> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row, error } = await (supabase as any)
    .from('transactions')
    .insert({ ...data, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return row as Transaction
}

export async function updateTransaction(
  supabase: SupabaseClient<Database>,
  id: string,
  data: TransactionUpdate
): Promise<Transaction> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row, error } = await (supabase as any)
    .from('transactions')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return row as Transaction
}

export async function deleteTransaction(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
}
