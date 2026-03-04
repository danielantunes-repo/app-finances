import Link from 'next/link'
import { Suspense } from 'react'
import { MonthFilter } from '@/components/month-filter'
import { logout } from '@/app/login/actions'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/dashboard" className="font-semibold text-gray-900">Finanças</Link>
            <Link href="/receitas" className="text-gray-600 hover:text-gray-900">Receitas</Link>
            <Link href="/despesas" className="text-gray-600 hover:text-gray-900">Despesas</Link>
            <Link href="/investimentos" className="text-gray-600 hover:text-gray-900">Investimentos</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Suspense fallback={<div className="w-40 h-8" />}>
              <MonthFilter />
            </Suspense>
            <form action={logout}>
              <button type="submit" className="text-sm text-gray-500 hover:text-gray-900">Sair</button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
