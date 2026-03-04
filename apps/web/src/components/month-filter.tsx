'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { currentYearMonth, formatMonthLabel, prevMonth, nextMonth } from '@/lib/month'

export function MonthFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const mes = searchParams.get('mes') ?? currentYearMonth()

  function navigate(newMes: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('mes', newMes)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => navigate(prevMonth(mes))}>‹</Button>
      <span className="text-sm font-medium w-36 text-center capitalize">
        {formatMonthLabel(mes)}
      </span>
      <Button variant="outline" size="sm" onClick={() => navigate(nextMonth(mes))}>›</Button>
    </div>
  )
}
