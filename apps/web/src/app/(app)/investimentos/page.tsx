import { createClient } from '@/lib/supabase/server'
import { getTransactionsByType, calcMonthlySummary } from '@finance/core'
import { currentYearMonth, parseYearMonth } from '@/lib/month'
import { InvestimentosClient } from './investimentos-client'

export default async function InvestimentosPage({
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

  const transactions = await getTransactionsByType(supabase as any, user.id, 'investimento', year, month)
  const summary = calcMonthlySummary(transactions)

  return <InvestimentosClient transactions={transactions} summary={summary} userId={user.id} mes={selectedMes} />
}
