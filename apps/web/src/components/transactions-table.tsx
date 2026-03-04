'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { CATEGORY_LABELS } from '@finance/core'
import type { Transaction } from '@finance/core'

interface TransactionsTableProps {
  transactions: Transaction[]
  onEdit: (t: Transaction) => void
  onDelete: (id: string) => void
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR')
}

export function TransactionsTable({ transactions, onEdit, onDelete }: TransactionsTableProps) {
  if (transactions.length === 0) {
    return <p className="text-center text-gray-500 py-8">Nenhum lançamento neste mês.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead>Recorrente</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((t) => (
          <TableRow key={t.id}>
            <TableCell>{formatDate(t.display_date ?? t.date)}</TableCell>
            <TableCell>{t.description ?? '—'}</TableCell>
            <TableCell>{CATEGORY_LABELS[t.category] ?? t.category}</TableCell>
            <TableCell className="text-right font-medium">{formatCurrency(t.amount)}</TableCell>
            <TableCell>
              {t.is_recurring && (
                <Badge variant="secondary">Dia {t.recurring_day}</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" onClick={() => onEdit(t)}>Editar</Button>
              <Button variant="ghost" size="sm" className="text-red-500" onClick={() => onDelete(t.id)}>
                Excluir
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
