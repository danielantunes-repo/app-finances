import { createClient } from '@/lib/supabase/server'
import { getTransactionsByType, calcMonthlySummary } from '@finance/core'
import { currentYearMonth, parseYearMonth } from '@/lib/month'
import { DespesasClient } from './despesas-client'

export default async function DespesasPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>
}) {
  const { mes } = await searchParams
  const selectedMes = mes ?? currentYearMonth()
  const { year, month } = parseYearMonth(selectedMes)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const transactions = await getTransactionsByType(supabase as any, user.id, 'despesa', year, month)
  const summary = calcMonthlySummary(transactions)

  return <DespesasClient transactions={transactions} summary={summary} userId={user.id} mes={selectedMes} />
}
