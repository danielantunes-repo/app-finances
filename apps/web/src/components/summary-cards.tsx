import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MonthlySummary } from '@finance/core'

interface SummaryCardsProps {
  summary: MonthlySummary
  type: 'receita' | 'despesa' | 'investimento'
}

const TYPE_LABELS = {
  receita: 'Receitas',
  despesa: 'Despesas',
  investimento: 'Investimentos',
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function SummaryCards({ summary, type }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Total {TYPE_LABELS[type]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(summary.total)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Maior lançamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(summary.largest)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Registros no mês</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summary.count}</p>
        </CardContent>
      </Card>
    </div>
  )
}
