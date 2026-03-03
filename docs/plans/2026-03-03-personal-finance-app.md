# Personal Finance App — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web (Next.js 16) + mobile (Expo 52) personal finance app with Supabase backend, shared core package, and features for tracking receitas, despesas, and investimentos with monthly filtering.

**Architecture:** Turborepo monorepo with pnpm workspaces. `packages/core` holds shared TypeScript types, Supabase client, Zod schemas, and query functions. `apps/web` (Next.js 16) and `apps/mobile` (Expo 52) are independent apps that consume core.

**Tech Stack:** Turborepo, pnpm 9+, TypeScript 5, Supabase (PostgreSQL + Auth + JS SDK v2), Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui, Expo 52, NativeWind v4, react-hook-form v7, Zod v3, Vitest

---

## Task 1: Monorepo scaffold

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `.gitignore`
- Create: `tsconfig.base.json`

**Step 1: Initialize root package**

```bash
cd e:/app-finance
pnpm init
```

**Step 2: Write root `package.json`**

```json
{
  "name": "app-finance",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint"
  },
  "devDependencies": {
    "turbo": "^2.3.0",
    "typescript": "^5.6.0"
  }
}
```

**Step 3: Write `pnpm-workspace.yaml`**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Step 4: Write `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {}
  }
}
```

**Step 5: Write `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

**Step 6: Write `.gitignore`**

```
node_modules/
.turbo/
dist/
.next/
.expo/
*.local
.env
.env.local
.env.*.local
```

**Step 7: Create directory structure**

```bash
mkdir -p packages/core/src
mkdir -p apps/web
mkdir -p apps/mobile
```

**Step 8: Install turbo**

```bash
pnpm install
```

Expected: `node_modules/` created at root, turbo installed.

**Step 9: Commit**

```bash
git init
git add .
git commit -m "chore: initialize turborepo monorepo"
```

---

## Task 2: packages/core — Setup

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/vitest.config.ts`
- Create: `packages/core/src/index.ts`

**Step 1: Write `packages/core/package.json`**

```json
{
  "name": "@finance/core",
  "version": "0.1.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.46.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@vitest/coverage-v8": "^2.1.0",
    "vitest": "^2.1.0"
  }
}
```

**Step 2: Write `packages/core/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**Step 3: Write `packages/core/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
})
```

**Step 4: Write empty `packages/core/src/index.ts`**

```typescript
// exports added as modules are created
```

**Step 5: Install core dependencies**

```bash
cd packages/core && pnpm install
```

**Step 6: Commit**

```bash
git add packages/core/
git commit -m "chore: scaffold @finance/core package"
```

---

## Task 3: packages/core — Types & Schemas

**Files:**
- Create: `packages/core/src/types.ts`
- Create: `packages/core/src/schemas.ts`
- Create: `packages/core/src/__tests__/schemas.test.ts`

**Step 1: Write the failing test**

```typescript
// packages/core/src/__tests__/schemas.test.ts
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
```

**Step 2: Run test to verify it fails**

```bash
cd packages/core && pnpm test
```

Expected: FAIL — `schemas` module not found.

**Step 3: Write `packages/core/src/types.ts`**

```typescript
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
```

**Step 4: Write `packages/core/src/schemas.ts`**

```typescript
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
```

**Step 5: Update `packages/core/src/index.ts`**

```typescript
export * from './types'
export * from './schemas'
```

**Step 6: Run test to verify it passes**

```bash
cd packages/core && pnpm test
```

Expected: PASS — all 5 tests green.

**Step 7: Commit**

```bash
git add packages/core/src/
git commit -m "feat(core): add Transaction types and Zod schemas"
```

---

## Task 4: packages/core — Supabase Client

**Files:**
- Create: `packages/core/src/supabase.ts`

**Step 1: Write `packages/core/src/supabase.ts`**

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Transaction } from './types'

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: Transaction
        Insert: Omit<Transaction, 'id' | 'created_at' | 'display_date'>
        Update: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'display_date'>>
      }
    }
  }
}

export function createSupabaseClient(url: string, anonKey: string): SupabaseClient<Database> {
  return createClient<Database>(url, anonKey)
}
```

**Step 2: Update `packages/core/src/index.ts`**

```typescript
export * from './types'
export * from './schemas'
export * from './supabase'
```

**Step 3: Build to ensure no TS errors**

```bash
cd packages/core && pnpm build
```

Expected: `dist/` created with no TypeScript errors.

**Step 4: Commit**

```bash
git add packages/core/src/supabase.ts packages/core/src/index.ts packages/core/dist/
git commit -m "feat(core): add typed Supabase client factory"
```

---

## Task 5: packages/core — Query Functions

**Files:**
- Create: `packages/core/src/queries.ts`
- Create: `packages/core/src/__tests__/queries.test.ts`

**Step 1: Write the failing test**

```typescript
// packages/core/src/__tests__/queries.test.ts
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
```

**Step 2: Run test to verify it fails**

```bash
cd packages/core && pnpm test
```

Expected: FAIL — `queries` module not found.

**Step 3: Write `packages/core/src/queries.ts`**

```typescript
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './supabase'
import type { Transaction, TransactionInsert, TransactionUpdate, MonthlySummary, TransactionType } from './types'

export function buildMonthRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`
  return { start, end }
}

export function projectRecurringTransaction(t: Transaction, year: number, month: number): Transaction {
  if (t.is_recurring && t.recurring_day) {
    const day = String(t.recurring_day).padStart(2, '0')
    const monthStr = String(month).padStart(2, '0')
    return { ...t, display_date: `${year}-${monthStr}-${day}` }
  }
  return { ...t, display_date: t.date }
}

export async function getTransactionsForMonth(
  supabase: SupabaseClient<Database>,
  userId: string,
  year: number,
  month: number
): Promise<Transaction[]> {
  const { start, end } = buildMonthRange(year, month)

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .or(`and(is_recurring.eq.false,date.gte.${start},date.lt.${end}),is_recurring.eq.true`)
    .order('date', { ascending: false })

  if (error) throw error
  return (data ?? []).map((t) => projectRecurringTransaction(t as Transaction, year, month))
}

export async function getTransactionsByType(
  supabase: SupabaseClient<Database>,
  userId: string,
  type: TransactionType,
  year: number,
  month: number
): Promise<Transaction[]> {
  const all = await getTransactionsForMonth(supabase, userId, year, month)
  return all.filter((t) => t.type === type)
}

export function calcMonthlySummary(transactions: Transaction[]): MonthlySummary {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0)
  const largest = transactions.reduce((max, t) => Math.max(max, t.amount), 0)
  return { total, count: transactions.length, largest }
}

export async function insertTransaction(
  supabase: SupabaseClient<Database>,
  userId: string,
  data: TransactionInsert
): Promise<Transaction> {
  const { data: row, error } = await supabase
    .from('transactions')
    .insert({ ...data, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return row as Transaction
}

export async function updateTransaction(
  supabase: SupabaseClient<Database>,
  id: string,
  data: TransactionUpdate
): Promise<Transaction> {
  const { data: row, error } = await supabase
    .from('transactions')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return row as Transaction
}

export async function deleteTransaction(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
}
```

**Step 4: Update `packages/core/src/index.ts`**

```typescript
export * from './types'
export * from './schemas'
export * from './supabase'
export * from './queries'
```

**Step 5: Run test to verify it passes**

```bash
cd packages/core && pnpm test
```

Expected: PASS — all tests green.

**Step 6: Build**

```bash
cd packages/core && pnpm build
```

Expected: no errors.

**Step 7: Commit**

```bash
git add packages/core/src/
git commit -m "feat(core): add transaction query functions with month projection"
```

---

## Task 6: Supabase Project Setup

> This task is done in the Supabase dashboard (https://supabase.com) and via SQL editor. No code is written to files.

**Step 1: Create Supabase project**

1. Go to https://supabase.com → New project
2. Name: `app-finance`
3. Choose region closest to you
4. Save the generated database password

**Step 2: Get credentials**

In Project Settings → API:
- Copy `Project URL` → will be `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` key → will be `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Step 3: Run migration in SQL Editor**

```sql
CREATE TABLE transactions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users NOT NULL,
  type          text NOT NULL CHECK (type IN ('receita', 'despesa', 'investimento')),
  category      text NOT NULL,
  description   text,
  amount        numeric(12, 2) NOT NULL,
  date          date NOT NULL,
  is_recurring  boolean NOT NULL DEFAULT false,
  recurring_day int CHECK (recurring_day BETWEEN 1 AND 31),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Index for fast user + date queries
CREATE INDEX transactions_user_date ON transactions (user_id, date DESC);
CREATE INDEX transactions_user_recurring ON transactions (user_id, is_recurring) WHERE is_recurring = true;

-- Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own transactions"
  ON transactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Step 4: Save migration file**

Create `packages/core/supabase/migrations/001_transactions.sql` with the SQL above.

**Step 5: Commit**

```bash
git add packages/core/supabase/
git commit -m "chore(core): add supabase migration for transactions table"
```

---

## Task 7: apps/web — Next.js 16 Setup

**Files:**
- Create: `apps/web/` (Next.js 16 app)
- Create: `apps/web/.env.local`

**Step 1: Scaffold Next.js 16 app**

```bash
cd apps
pnpm create next-app@latest web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

When prompted, accept defaults.

**Step 2: Add `@finance/core` as dependency**

Edit `apps/web/package.json` — add to `dependencies`:

```json
{
  "dependencies": {
    "@finance/core": "workspace:*",
    "@supabase/ssr": "^0.5.0",
    "@supabase/supabase-js": "^2.46.0",
    ...existing...
  }
}
```

**Step 3: Install shadcn/ui**

```bash
cd apps/web
pnpm dlx shadcn@latest init
```

Choose: Default style, Slate base color, CSS variables: yes.

**Step 4: Add required shadcn components**

```bash
pnpm dlx shadcn@latest add button card dialog form input label select table badge
```

**Step 5: Write `apps/web/.env.local`**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Replace with actual values from Task 6 Step 2.

**Step 6: Install dependencies**

```bash
cd e:/app-finance && pnpm install
```

**Step 7: Verify dev server starts**

```bash
cd apps/web && pnpm dev
```

Expected: Next.js dev server running at http://localhost:3000

Stop with Ctrl+C.

**Step 8: Commit**

```bash
git add apps/web/
git commit -m "chore(web): scaffold Next.js 16 app with Tailwind and shadcn/ui"
```

---

## Task 8: apps/web — Supabase Client Setup

**Files:**
- Create: `apps/web/src/lib/supabase/client.ts`
- Create: `apps/web/src/lib/supabase/server.ts`
- Create: `apps/web/src/middleware.ts`

**Step 1: Write browser Supabase client**

```typescript
// apps/web/src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 2: Write server Supabase client**

```typescript
// apps/web/src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

**Step 3: Write `apps/web/src/middleware.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

**Step 4: Build to verify no TS errors**

```bash
cd apps/web && pnpm build
```

Expected: build succeeds (or only known warnings, no errors).

**Step 5: Commit**

```bash
git add apps/web/src/
git commit -m "feat(web): add Supabase SSR client and auth middleware"
```

---

## Task 9: apps/web — Login Page

**Files:**
- Create: `apps/web/src/app/login/page.tsx`
- Create: `apps/web/src/app/login/actions.ts`

**Step 1: Write server actions**

```typescript
// apps/web/src/app/login/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function register(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

**Step 2: Write login page**

```tsx
// apps/web/src/app/login/page.tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { login, register } from './actions'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const action = mode === 'login' ? login : register
    const result = await action(formData)
    if (result?.error) setError(result.error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{mode === 'login' ? 'Entrar' : 'Criar conta'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full">
              {mode === 'login' ? 'Entrar' : 'Cadastrar'}
            </Button>
          </form>
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="mt-4 text-sm text-gray-500 hover:underline w-full text-center"
          >
            {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 3: Verify build**

```bash
cd apps/web && pnpm build
```

**Step 4: Commit**

```bash
git add apps/web/src/app/login/
git commit -m "feat(web): add login/register page with Supabase Auth"
```

---

## Task 10: apps/web — Layout with Month Filter

**Files:**
- Create: `apps/web/src/app/(app)/layout.tsx`
- Create: `apps/web/src/components/month-filter.tsx`
- Create: `apps/web/src/lib/month.ts`

**Step 1: Write month utility**

```typescript
// apps/web/src/lib/month.ts
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
```

**Step 2: Write MonthFilter component**

```tsx
// apps/web/src/components/month-filter.tsx
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
```

**Step 3: Write app layout with navbar**

```tsx
// apps/web/src/app/(app)/layout.tsx
import Link from 'next/link'
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
            <MonthFilter />
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
```

**Step 4: Create redirect from `/` to `/dashboard`**

```typescript
// apps/web/src/app/page.tsx
import { redirect } from 'next/navigation'
export default function Home() {
  redirect('/dashboard')
}
```

**Step 5: Build**

```bash
cd apps/web && pnpm build
```

**Step 6: Commit**

```bash
git add apps/web/src/
git commit -m "feat(web): add app layout with navbar and month filter"
```

---

## Task 11: apps/web — Summary Cards Component

**Files:**
- Create: `apps/web/src/components/summary-cards.tsx`

**Step 1: Write SummaryCards component**

```tsx
// apps/web/src/components/summary-cards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MonthlySummary } from '@finance/core'

interface SummaryCardsProps {
  summary: MonthlySummary
  type: 'receita' | 'despesa' | 'investimento'
}

const TYPE_LABELS = {
  receita: 'Receitas',
  despesa: 'Despesas',
  investimento: 'Investimentos',
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function SummaryCards({ summary, type }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Total {TYPE_LABELS[type]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(summary.total)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Maior lançamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(summary.largest)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Registros no mês</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summary.count}</p>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add apps/web/src/components/summary-cards.tsx
git commit -m "feat(web): add SummaryCards component"
```

---

## Task 12: apps/web — Transactions Table Component

**Files:**
- Create: `apps/web/src/components/transactions-table.tsx`

**Step 1: Write TransactionsTable component**

```tsx
// apps/web/src/components/transactions-table.tsx
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
```

**Step 2: Commit**

```bash
git add apps/web/src/components/transactions-table.tsx
git commit -m "feat(web): add TransactionsTable component"
```

---

## Task 13: apps/web — Transaction Form Modal

**Files:**
- Create: `apps/web/src/components/transaction-form.tsx`

**Step 1: Write TransactionForm component**

```tsx
// apps/web/src/components/transaction-form.tsx
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
    }
  }, [transaction, form])

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
                <Select onValueChange={field.onChange} value={field.value}>
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
              <label htmlFor="is_recurring" className="text-sm">Despesa recorrente</label>
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
```

**Step 2: Install `@hookform/resolvers`**

```bash
cd apps/web && pnpm add @hookform/resolvers react-hook-form
```

**Step 3: Commit**

```bash
git add apps/web/src/components/transaction-form.tsx
git commit -m "feat(web): add TransactionForm modal component"
```

---

## Task 14: apps/web — Receitas Page

**Files:**
- Create: `apps/web/src/app/(app)/receitas/page.tsx`
- Create: `apps/web/src/app/(app)/receitas/receitas-client.tsx`

**Step 1: Write server page (data fetching)**

```tsx
// apps/web/src/app/(app)/receitas/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getTransactionsByType, calcMonthlySummary } from '@finance/core'
import { currentYearMonth, parseYearMonth } from '@/lib/month'
import { ReceitasClient } from './receitas-client'

export default async function ReceitasPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>
}) {
  const { mes } = await searchParams
  const selectedMes = mes ?? currentYearMonth()
  const { year, month } = parseYearMonth(selectedMes)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const transactions = await getTransactionsByType(supabase as any, user.id, 'receita', year, month)
  const summary = calcMonthlySummary(transactions)

  return <ReceitasClient transactions={transactions} summary={summary} userId={user.id} mes={selectedMes} />
}
```

**Step 2: Write client component**

```tsx
// apps/web/src/app/(app)/receitas/receitas-client.tsx
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

export function ReceitasClient({ transactions, summary, userId, mes }: ReceitasClientProps) {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const supabase = createClient()

  async function handleSubmit(values: TransactionFormValues) {
    if (editing) {
      await updateTransaction(supabase as any, editing.id, values)
    } else {
      await insertTransaction(supabase as any, userId, { ...values, description: values.description ?? null, recurring_day: values.recurring_day ?? null })
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
```

**Step 3: Build**

```bash
cd apps/web && pnpm build
```

**Step 4: Commit**

```bash
git add apps/web/src/app/\(app\)/receitas/
git commit -m "feat(web): add receitas page with cards and table"
```

---

## Task 15: apps/web — Despesas & Investimentos Pages

> Follow the same pattern as Task 14. Create the `despesas` and `investimentos` pages by copying and adapting `receitas`.

**Files:**
- Create: `apps/web/src/app/(app)/despesas/page.tsx`
- Create: `apps/web/src/app/(app)/despesas/despesas-client.tsx`
- Create: `apps/web/src/app/(app)/investimentos/page.tsx`
- Create: `apps/web/src/app/(app)/investimentos/investimentos-client.tsx`

**Step 1: Create `despesas/page.tsx`** — copy `receitas/page.tsx`, replace `'receita'` with `'despesa'`, `ReceitasClient` → `DespesasClient`.

**Step 2: Create `despesas/despesas-client.tsx`** — copy `receitas-client.tsx`, replace all `receitas` → `despesas`, `'receita'` → `'despesa'`, `Receitas` → `Despesas`.

**Step 3: Create `investimentos/page.tsx`** — same pattern with `'investimento'`.

**Step 4: Create `investimentos/investimentos-client.tsx`** — same pattern with `'investimento'`.

**Step 5: Build and verify**

```bash
cd apps/web && pnpm build
```

**Step 6: Commit**

```bash
git add apps/web/src/app/\(app\)/despesas/ apps/web/src/app/\(app\)/investimentos/
git commit -m "feat(web): add despesas and investimentos pages"
```

---

## Task 16: apps/web — Dashboard Page

**Files:**
- Create: `apps/web/src/app/(app)/dashboard/page.tsx`

**Step 1: Write dashboard page**

```tsx
// apps/web/src/app/(app)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getTransactionsForMonth, calcMonthlySummary } from '@finance/core'
import { currentYearMonth, parseYearMonth, formatMonthLabel } from '@/lib/month'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>
}) {
  const { mes } = await searchParams
  const selectedMes = mes ?? currentYearMonth()
  const { year, month } = parseYearMonth(selectedMes)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const all = await getTransactionsForMonth(supabase as any, user.id, year, month)

  const receitas = calcMonthlySummary(all.filter((t) => t.type === 'receita'))
  const despesas = calcMonthlySummary(all.filter((t) => t.type === 'despesa'))
  const investimentos = calcMonthlySummary(all.filter((t) => t.type === 'investimento'))

  const saldo = receitas.total - despesas.total - investimentos.total

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold capitalize">{formatMonthLabel(selectedMes)}</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={saldo >= 0 ? 'border-green-200' : 'border-red-200'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(saldo)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(receitas.total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(despesas.total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Investimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(investimentos.total)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

**Step 2: Build**

```bash
cd apps/web && pnpm build
```

**Step 3: Commit**

```bash
git add apps/web/src/app/\(app\)/dashboard/
git commit -m "feat(web): add dashboard with monthly balance summary"
```

---

## Task 17: apps/mobile — Expo 52 Setup

**Files:**
- Create: `apps/mobile/` (Expo app)

**Step 1: Scaffold Expo app**

```bash
cd apps
pnpm create expo-app@latest mobile --template blank-typescript
```

**Step 2: Add Expo Router and NativeWind**

```bash
cd apps/mobile
pnpm add expo-router nativewind react-native-safe-area-context react-native-screens
pnpm add -D tailwindcss@3
pnpm dlx tailwindcss init
```

**Step 3: Configure NativeWind — `tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: { extend: {} },
  plugins: [],
}
```

**Step 4: Update `babel.config.js`**

```javascript
module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  }
}
```

**Step 5: Add `@finance/core` dependency to mobile**

In `apps/mobile/package.json`:

```json
{
  "dependencies": {
    "@finance/core": "workspace:*",
    "@supabase/supabase-js": "^2.46.0",
    ...
  }
}
```

**Step 6: Create `.env` in `apps/mobile`**

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Step 7: Install all dependencies**

```bash
cd e:/app-finance && pnpm install
```

**Step 8: Verify Expo starts**

```bash
cd apps/mobile && pnpm start
```

Expected: Expo dev server starts. Press `q` to quit.

**Step 9: Commit**

```bash
git add apps/mobile/
git commit -m "chore(mobile): scaffold Expo 52 app with NativeWind and Expo Router"
```

---

## Task 18: apps/mobile — Supabase Client & Auth

**Files:**
- Create: `apps/mobile/lib/supabase.ts`
- Create: `apps/mobile/context/auth.tsx`

**Step 1: Write Supabase client for React Native**

```typescript
// apps/mobile/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

**Step 2: Install AsyncStorage**

```bash
cd apps/mobile && npx expo install @react-native-async-storage/async-storage
```

**Step 3: Write Auth context**

```tsx
// apps/mobile/context/auth.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

const AuthContext = createContext<{ session: Session | null; loading: boolean }>({
  session: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
```

**Step 4: Commit**

```bash
git add apps/mobile/lib/ apps/mobile/context/
git commit -m "feat(mobile): add Supabase client and auth context"
```

---

## Task 19: apps/mobile — Navigation & Screens

**Files:**
- Create: `apps/mobile/app/_layout.tsx`
- Create: `apps/mobile/app/(auth)/login.tsx`
- Create: `apps/mobile/app/(app)/_layout.tsx`
- Create: `apps/mobile/app/(app)/index.tsx` (dashboard)
- Create: `apps/mobile/app/(app)/receitas.tsx`
- Create: `apps/mobile/app/(app)/despesas.tsx`
- Create: `apps/mobile/app/(app)/investimentos.tsx`
- Create: `apps/mobile/app/(app)/novo.tsx`

**Step 1: Write root layout**

```tsx
// apps/mobile/app/_layout.tsx
import { Stack } from 'expo-router'
import { AuthProvider, useAuth } from '../context/auth'
import { useEffect } from 'react'
import { useRouter, useSegments } from 'expo-router'

function RootLayoutNav() {
  const { session, loading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    const inApp = segments[0] === '(app)'
    if (!session && inApp) router.replace('/(auth)/login')
    if (session && !inApp) router.replace('/(app)/')
  }, [session, loading, segments])

  return <Stack screenOptions={{ headerShown: false }} />
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  )
}
```

**Step 2: Write login screen**

```tsx
// apps/mobile/app/(auth)/login.tsx
import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { supabase } from '../../lib/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    const fn = mode === 'login'
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password })
    const { error } = await fn
    setLoading(false)
    if (error) Alert.alert('Erro', error.message)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mode === 'login' ? 'Entrar' : 'Cadastrar'}</Text>
      <TextInput style={styles.input} placeholder="Email" value={email}
        onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Senha" value={password}
        onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
        <Text style={styles.link}>
          {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f9fafb' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12 },
  btn: { backgroundColor: '#111827', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
  link: { color: '#6b7280', textAlign: 'center', fontSize: 14 },
})
```

**Step 3: Write app tab layout**

```tsx
// apps/mobile/app/(app)/_layout.tsx
import { Tabs } from 'expo-router'

export default function AppLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#111827' }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarLabel: 'Início' }} />
      <Tabs.Screen name="receitas" options={{ title: 'Receitas' }} />
      <Tabs.Screen name="despesas" options={{ title: 'Despesas' }} />
      <Tabs.Screen name="investimentos" options={{ title: 'Invest.' }} />
      <Tabs.Screen name="novo" options={{ title: 'Novo', tabBarLabel: '+ Novo' }} />
    </Tabs>
  )
}
```

**Step 4: Write dashboard screen**

```tsx
// apps/mobile/app/(app)/index.tsx
import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/auth'
import { getTransactionsForMonth, calcMonthlySummary } from '@finance/core'

function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

export default function DashboardScreen() {
  const { session } = useAuth()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const [data, setData] = useState({ receitas: 0, despesas: 0, investimentos: 0 })

  useEffect(() => {
    if (!session) return
    getTransactionsForMonth(supabase as any, session.user.id, year, month).then((all) => {
      setData({
        receitas: calcMonthlySummary(all.filter((t) => t.type === 'receita')).total,
        despesas: calcMonthlySummary(all.filter((t) => t.type === 'despesa')).total,
        investimentos: calcMonthlySummary(all.filter((t) => t.type === 'investimento')).total,
      })
    })
  }, [session])

  const saldo = data.receitas - data.despesas - data.investimentos

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dashboard</Text>
      {[
        { label: 'Saldo', value: saldo, color: saldo >= 0 ? '#16a34a' : '#dc2626' },
        { label: 'Receitas', value: data.receitas, color: '#16a34a' },
        { label: 'Despesas', value: data.despesas, color: '#dc2626' },
        { label: 'Investimentos', value: data.investimentos, color: '#2563eb' },
      ].map(({ label, value, color }) => (
        <View key={label} style={styles.card}>
          <Text style={styles.cardLabel}>{label}</Text>
          <Text style={[styles.cardValue, { color }]}>{fmt(value)}</Text>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardLabel: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  cardValue: { fontSize: 24, fontWeight: '700' },
})
```

**Step 5: Write receitas, despesas, investimentos screens**

Each screen follows the same pattern — only the `type` changes. Here is `receitas.tsx`; copy it for `despesas.tsx` (type=`'despesa'`) and `investimentos.tsx` (type=`'investimento'`):

```tsx
// apps/mobile/app/(app)/receitas.tsx
import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/auth'
import { getTransactionsByType, calcMonthlySummary, deleteTransaction, CATEGORY_LABELS } from '@finance/core'
import type { Transaction } from '@finance/core'

function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

export default function ReceitasScreen() {
  const { session } = useAuth()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const load = useCallback(async () => {
    if (!session) return
    const data = await getTransactionsByType(supabase as any, session.user.id, 'receita', year, month)
    setTransactions(data)
  }, [session])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const summary = calcMonthlySummary(transactions)

  async function handleDelete(id: string) {
    Alert.alert('Confirmar', 'Excluir lançamento?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        await deleteTransaction(supabase as any, id)
        load()
      }},
    ])
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receitas</Text>
      <View style={styles.cardsRow}>
        <View style={styles.card}><Text style={styles.cardLabel}>Total</Text><Text style={styles.cardValue}>{fmt(summary.total)}</Text></View>
        <View style={styles.card}><Text style={styles.cardLabel}>Registros</Text><Text style={styles.cardValue}>{summary.count}</Text></View>
      </View>
      <FlatList
        data={transactions}
        keyExtractor={(t) => t.id}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum lançamento.</Text>}
        renderItem={({ item: t }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowDesc}>{t.description ?? CATEGORY_LABELS[t.category]}</Text>
              <Text style={styles.rowMeta}>{CATEGORY_LABELS[t.category]} · {t.display_date ?? t.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.rowAmount}>{fmt(t.amount)}</Text>
              <TouchableOpacity onPress={() => handleDelete(t.id)}>
                <Text style={styles.deleteBtn}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 2 },
  cardLabel: { fontSize: 12, color: '#6b7280' },
  cardValue: { fontSize: 20, fontWeight: '700' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 32 },
  row: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8, flexDirection: 'row' },
  rowDesc: { fontWeight: '600', fontSize: 14 },
  rowMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  rowAmount: { fontWeight: '700', fontSize: 15 },
  deleteBtn: { fontSize: 12, color: '#ef4444', marginTop: 4 },
})
```

**Step 6: Write `novo.tsx` screen (new transaction)**

```tsx
// apps/mobile/app/(app)/novo.tsx
import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/auth'
import { insertTransaction, CATEGORIES, CATEGORY_LABELS, transactionSchema } from '@finance/core'
import type { TransactionType } from '@finance/core'

export default function NovoScreen() {
  const { session } = useAuth()
  const router = useRouter()
  const [type, setType] = useState<TransactionType>('despesa')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringDay, setRecurringDay] = useState('')

  async function handleSave() {
    if (!session) return
    const parsed = transactionSchema.safeParse({
      type, category, description: description || null,
      amount: parseFloat(amount), date, is_recurring: isRecurring,
      recurring_day: isRecurring ? parseInt(recurringDay) : null,
    })
    if (!parsed.success) {
      Alert.alert('Erro', parsed.error.errors[0].message)
      return
    }
    await insertTransaction(supabase as any, session.user.id, {
      ...parsed.data,
      description: parsed.data.description ?? null,
      recurring_day: parsed.data.recurring_day ?? null,
    })
    router.back()
  }

  const categories = CATEGORIES[type]

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Novo lançamento</Text>

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.segmented}>
        {(['receita', 'despesa', 'investimento'] as TransactionType[]).map((t) => (
          <TouchableOpacity key={t} style={[styles.segment, type === t && styles.segmentActive]}
            onPress={() => { setType(t); setCategory('') }}>
            <Text style={[styles.segmentText, type === t && styles.segmentTextActive]}>
              {t === 'receita' ? 'Receita' : t === 'despesa' ? 'Despesa' : 'Invest.'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={category} onValueChange={setCategory}>
          <Picker.Item label="Selecione..." value="" />
          {categories.map((c) => <Picker.Item key={c} label={CATEGORY_LABELS[c]} value={c} />)}
        </Picker>
      </View>

      <Text style={styles.label}>Descrição</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} />

      <Text style={styles.label}>Valor (R$)</Text>
      <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" />

      <Text style={styles.label}>Data</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Recorrente</Text>
        <Switch value={isRecurring} onValueChange={setIsRecurring} />
      </View>

      {isRecurring && (
        <>
          <Text style={styles.label}>Dia do mês (1-31)</Text>
          <TextInput style={styles.input} value={recurringDay} onChangeText={setRecurringDay} keyboardType="numeric" />
        </>
      )}

      <TouchableOpacity style={styles.btn} onPress={handleSave}>
        <Text style={styles.btnText}>Salvar</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12 },
  pickerWrap: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8 },
  segmented: { flexDirection: 'row', backgroundColor: '#e5e7eb', borderRadius: 8, padding: 2 },
  segment: { flex: 1, padding: 8, alignItems: 'center', borderRadius: 6 },
  segmentActive: { backgroundColor: '#fff' },
  segmentText: { fontSize: 13, color: '#6b7280' },
  segmentTextActive: { fontWeight: '600', color: '#111827' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  btn: { backgroundColor: '#111827', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
})
```

**Step 7: Install Picker**

```bash
cd apps/mobile && npx expo install @react-native-picker/picker
```

**Step 8: Commit**

```bash
git add apps/mobile/app/
git commit -m "feat(mobile): add all screens (auth, dashboard, transactions, new)"
```

---

## Task 20: Final Integration Check

**Step 1: Build web app**

```bash
cd apps/web && pnpm build
```

Expected: Build succeeds, no TypeScript errors.

**Step 2: Run core tests**

```bash
cd packages/core && pnpm test
```

Expected: All tests pass.

**Step 3: Start web dev server**

```bash
cd apps/web && pnpm dev
```

Manual test checklist:
- [ ] `/login` redirects to `/dashboard` when not authenticated
- [ ] Register and login works
- [ ] Month filter updates URL and refreshes data
- [ ] Receitas/Despesas/Investimentos pages load with correct cards
- [ ] New transaction form opens, validates, saves, and refreshes
- [ ] Edit transaction populates form and saves
- [ ] Delete transaction shows confirm and removes row
- [ ] Recurring transaction appears on all months

**Step 4: Start mobile dev server**

```bash
cd apps/mobile && pnpm start
```

Scan QR code with Expo Go to test on device/simulator.

Manual test checklist:
- [ ] Login screen appears when not authenticated
- [ ] Login/register works
- [ ] Dashboard shows correct saldo
- [ ] Each tab (Receitas/Despesas/Investimentos) loads correctly
- [ ] Novo screen saves a transaction and appears in correct tab

**Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete personal finance app (web + mobile)"
```

---

## Environment Variables Reference

**apps/web/.env.local**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**apps/mobile/.env**
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
