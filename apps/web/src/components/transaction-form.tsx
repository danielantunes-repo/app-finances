'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { transactionSchema, CATEGORIES, CATEGORY_LABELS, TRANSACTION_TYPES } from '@finance/core'
import type { Transaction, TransactionFormValues } from '@finance/core'

interface TransactionFormProps {
  open: boolean
  defaultType?: 'receita' | 'despesa' | 'investimento'
  transaction?: Transaction | null
  onClose: () => void
  onSubmit: (values: TransactionFormValues) => Promise<void>
}

export function TransactionForm({ open, defaultType = 'despesa', transaction, onClose, onSubmit }: TransactionFormProps) {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultType,
      category: '',
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      is_recurring: false,
      recurring_day: null,
    },
  })

  const type = form.watch('type')
  const isRecurring = form.watch('is_recurring')

  useEffect(() => {
    if (transaction) {
      form.reset({
        type: transaction.type,
        category: transaction.category,
        description: transaction.description ?? '',
        amount: transaction.amount,
        date: transaction.date,
        is_recurring: transaction.is_recurring,
        recurring_day: transaction.recurring_day,
      })
    } else {
      form.reset({
        type: defaultType,
        category: '',
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        is_recurring: false,
        recurring_day: null,
      })
    }
  }, [transaction, defaultType, form])

  const categories = CATEGORIES[type] ?? []

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Editar lançamento' : 'Novo lançamento'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={(v) => { field.onChange(v); form.setValue('category', '') }} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {TRANSACTION_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t === 'receita' ? 'Receita' : t === 'despesa' ? 'Despesa' : 'Investimento'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0.01"
                    {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="date" render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_recurring"
                {...form.register('is_recurring')}
                className="w-4 h-4" />
              <label htmlFor="is_recurring" className="text-sm">Lançamento recorrente</label>
            </div>

            {isRecurring && (
              <FormField control={form.control} name="recurring_day" render={({ field }) => (
                <FormItem>
                  <FormLabel>Dia do mês (1-31)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={31}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
