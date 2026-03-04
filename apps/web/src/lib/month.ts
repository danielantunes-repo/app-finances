export function currentYearMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function parseYearMonth(mes: string): { year: number; month: number } {
  const [year, month] = mes.split('-').map(Number)
  return { year, month }
}

export function formatMonthLabel(mes: string): string {
  const [year, month] = mes.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

export function prevMonth(mes: string): string {
  const { year, month } = parseYearMonth(mes)
  const d = new Date(year, month - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function nextMonth(mes: string): string {
  const { year, month } = parseYearMonth(mes)
  const d = new Date(year, month, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
