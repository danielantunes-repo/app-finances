'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SummaryCards } from '@/components/summary-cards'
import { TransactionsTable } from '@/components/transactions-table'
import { TransactionForm } from '@/components/transaction-form'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { insertTransaction, updateTransaction, deleteTransaction } from '@finance/core'
import type { Transaction, MonthlySummary, TransactionFormValues } from '@finance/core'

interface ReceitasClientProps {
  transactions: Transaction[]
  summary: MonthlySummary
  userId: string
  mes: string
}

export function ReceitasClient({ transactions, summary, userId }: ReceitasClientProps) {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const supabase = createClient()

  async function handleSubmit(values: TransactionFormValues) {
    if (editing) {
      await updateTransaction(supabase as any, editing.id, values)
    } else {
      await insertTransaction(supabase as any, userId, {
        ...values,
        description: values.description ?? null,
        recurring_day: values.recurring_day ?? null,
      })
    }
    setFormOpen(false)
    setEditing(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este lançamento?')) return
    await deleteTransaction(supabase as any, id)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Receitas</h1>
        <Button onClick={() => { setEditing(null); setFormOpen(true) }}>+ Novo</Button>
      </div>
      <SummaryCards summary={summary} type="receita" />
      <TransactionsTable
        transactions={transactions}
        onEdit={(t) => { setEditing(t); setFormOpen(true) }}
        onDelete={handleDelete}
      />
      <TransactionForm
        open={formOpen}
        defaultType="receita"
        transaction={editing}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
