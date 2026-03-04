export type TransactionType = 'receita' | 'despesa' | 'investimento'

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  category: string
  description: string | null
  amount: number
  date: string              // ISO date string: YYYY-MM-DD
  is_recurring: boolean
  recurring_day: number | null  // 1-31, only when is_recurring = true
  created_at: string
  display_date?: string     // computed for recurring transactions in month view
}

export type TransactionInsert = Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'display_date'>

export type TransactionUpdate = Partial<TransactionInsert>

export interface MonthlySummary {
  total: number
  count: number
  largest: number
}

export interface MonthFilter {
  year: number
  month: number  // 1-12
}
