import { describe, it, expect } from 'vitest'
import { buildMonthRange, projectRecurringTransaction } from '../queries'

describe('buildMonthRange', () => {
  it('returns start and end dates for a given month', () => {
    const { start, end } = buildMonthRange(2026, 3)
    expect(start).toBe('2026-03-01')
    expect(end).toBe('2026-04-01')
  })

  it('handles December correctly', () => {
    const { start, end } = buildMonthRange(2025, 12)
    expect(start).toBe('2025-12-01')
    expect(end).toBe('2026-01-01')
  })
})

describe('projectRecurringTransaction', () => {
  it('overrides display_date using recurring_day in selected month', () => {
    const t = {
      id: '1', user_id: 'u1', type: 'despesa' as const,
      category: 'moradia', description: 'Aluguel', amount: 1500,
      date: '2026-01-05', is_recurring: true, recurring_day: 5, created_at: ''
    }
    const result = projectRecurringTransaction(t, 2026, 3)
    expect(result.display_date).toBe('2026-03-05')
  })

  it('keeps display_date as date for non-recurring', () => {
    const t = {
      id: '2', user_id: 'u1', type: 'receita' as const,
      category: 'salario', description: null, amount: 5000,
      date: '2026-03-01', is_recurring: false, recurring_day: null, created_at: ''
    }
    const result = projectRecurringTransaction(t, 2026, 3)
    expect(result.display_date).toBe('2026-03-01')
  })
})
