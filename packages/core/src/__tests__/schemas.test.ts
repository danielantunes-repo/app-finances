import { describe, it, expect } from 'vitest'
import { transactionSchema, CATEGORIES } from '../schemas'

describe('transactionSchema', () => {
  it('validates a valid receita transaction', () => {
    const result = transactionSchema.safeParse({
      type: 'receita',
      category: 'salario',
      description: 'Salário março',
      amount: 5000,
      date: '2026-03-05',
      is_recurring: false,
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid type', () => {
    const result = transactionSchema.safeParse({
      type: 'invalido',
      category: 'salario',
      amount: 100,
      date: '2026-03-05',
      is_recurring: false,
    })
    expect(result.success).toBe(false)
  })

  it('requires recurring_day when is_recurring is true', () => {
    const result = transactionSchema.safeParse({
      type: 'despesa',
      category: 'moradia',
      amount: 1500,
      date: '2026-03-01',
      is_recurring: true,
      recurring_day: undefined,
    })
    expect(result.success).toBe(false)
  })

  it('accepts recurring transaction with recurring_day', () => {
    const result = transactionSchema.safeParse({
      type: 'despesa',
      category: 'moradia',
      amount: 1500,
      date: '2026-03-01',
      is_recurring: true,
      recurring_day: 5,
    })
    expect(result.success).toBe(true)
  })
})

describe('CATEGORIES', () => {
  it('has categories for each transaction type', () => {
    expect(CATEGORIES.receita.length).toBeGreaterThan(0)
    expect(CATEGORIES.despesa.length).toBeGreaterThan(0)
    expect(CATEGORIES.investimento.length).toBeGreaterThan(0)
  })
})
