import { z } from 'zod'
import type { TransactionType } from './types'

export const TRANSACTION_TYPES: TransactionType[] = ['receita', 'despesa', 'investimento']

export const CATEGORIES: Record<TransactionType, string[]> = {
  receita: ['salario', 'venda', 'emprestimo', 'outros'],
  despesa: ['moradia', 'alimentacao', 'transporte', 'saude', 'educacao', 'lazer', 'recorrente', 'outros'],
  investimento: ['renda_fixa', 'renda_variavel', 'tesouro_direto', 'fii', 'outros'],
}

export const CATEGORY_LABELS: Record<string, string> = {
  salario: 'Salário',
  venda: 'Venda',
  emprestimo: 'Empréstimo',
  moradia: 'Moradia',
  alimentacao: 'Alimentação',
  transporte: 'Transporte',
  saude: 'Saúde',
  educacao: 'Educação',
  lazer: 'Lazer',
  recorrente: 'Recorrente',
  renda_fixa: 'Renda Fixa',
  renda_variavel: 'Renda Variável',
  tesouro_direto: 'Tesouro Direto',
  fii: 'FII',
  outros: 'Outros',
}

export const transactionSchema = z
  .object({
    type: z.enum(['receita', 'despesa', 'investimento']),
    category: z.string().min(1),
    description: z.string().optional().nullable(),
    amount: z.number().positive(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    is_recurring: z.boolean(),
    recurring_day: z.number().int().min(1).max(31).optional().nullable(),
  })
  .refine(
    (data) => !data.is_recurring || (data.recurring_day !== undefined && data.recurring_day !== null),
    {
      message: 'recurring_day is required when is_recurring is true',
      path: ['recurring_day'],
    }
  )

export type TransactionFormValues = z.infer<typeof transactionSchema>
