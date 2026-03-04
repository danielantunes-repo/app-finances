import { createClient } from '@/lib/supabase/server'
import { getTransactionsForMonth, calcMonthlySummary } from '@finance/core'
import { currentYearMonth, parseYearMonth, formatMonthLabel } from '@/lib/month'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function DashboardPage({
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

  const all = await getTransactionsForMonth(supabase as any, user.id, year, month)

  const receitas = calcMonthlySummary(all.filter((t) => t.type === 'receita'))
  const despesas = calcMonthlySummary(all.filter((t) => t.type === 'despesa'))
  const investimentos = calcMonthlySummary(all.filter((t) => t.type === 'investimento'))

  const saldo = receitas.total - despesas.total - investimentos.total

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold capitalize">{formatMonthLabel(selectedMes)}</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={saldo >= 0 ? 'border-green-200' : 'border-red-200'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(saldo)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(receitas.total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(despesas.total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Investimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(investimentos.total)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
