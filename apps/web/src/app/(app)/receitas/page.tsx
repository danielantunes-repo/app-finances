import { createClient } from '@/lib/supabase/server'
import { getTransactionsByType, calcMonthlySummary } from '@finance/core'
import { currentYearMonth, parseYearMonth } from '@/lib/month'
import { ReceitasClient } from './receitas-client'

export default async function ReceitasPage({
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

  const transactions = await getTransactionsByType(supabase as any, user.id, 'receita', year, month)
  const summary = calcMonthlySummary(transactions)

  return <ReceitasClient transactions={transactions} summary={summary} userId={user.id} mes={selectedMes} />
}
