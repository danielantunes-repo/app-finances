# Personal Finance App — Design Document

**Date:** 2026-03-03
**Status:** Approved

---

## Overview

A personal finance web + mobile application for tracking income (receitas), expenses (despesas), and investments (investimentos). Users can log transactions, view monthly summaries via cards and tables, and filter all data by a global month selector.

---

## Architecture

### Monorepo (Turborepo + pnpm)

```
app-finance/
  packages/
    core/             ← TypeScript types, Supabase client, Zod schemas, queries
  apps/
    web/              ← Next.js 16 (App Router), Tailwind CSS, shadcn/ui
    mobile/           ← Expo 52, NativeWind
  turbo.json
  package.json
```

The `packages/core` package is the shared foundation: all TypeScript interfaces, Supabase queries, Zod validation schemas, and business logic live here. Both apps consume it.

---

## Tech Stack

| Concern | Web | Mobile | Shared |
|---|---|---|---|
| Framework | Next.js 16 (App Router) | Expo 52 | — |
| Styling | Tailwind CSS + shadcn/ui | NativeWind | — |
| Auth | Supabase Auth (email/password) | Supabase Auth | `@finance/core` |
| Database | Supabase PostgreSQL | Supabase PostgreSQL | `@finance/core` |
| Forms | react-hook-form + zod | react-hook-form + zod | Zod schemas in core |
| State/Filter | URL params (`?mes=2026-03`) + React context | Expo Router params + context | — |
| Package manager | pnpm | pnpm | pnpm workspaces |

---

## Data Model

### Supabase PostgreSQL

```sql
-- Auth managed by Supabase
-- auth.users (id, email, ...)

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

-- Row Level Security: users only access their own data
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own transactions"
  ON transactions FOR ALL
  USING (auth.uid() = user_id);
```

### Categories

| Type | Categories |
|---|---|
| receita | salário, venda, empréstimo, outros |
| despesa | moradia, alimentação, transporte, saúde, educação, lazer, recorrente, outros |
| investimento | renda fixa, renda variável, tesouro direto, FII, outros |

### Recurring Expenses

`is_recurring = true` + `recurring_day` (day of month). When filtering by month, recurring transactions are automatically projected into every month — they appear in the month view without needing a separate entry per month.

---

## Screens & Navigation

### Web (Next.js 16)

```
/login               ← Supabase Auth login/register
/dashboard           ← Summary: balance, total receitas, despesas, investimentos
/receitas            ← Summary card + monthly table
/despesas            ← Summary card + monthly table
/investimentos       ← Summary card + monthly table
/novo                ← New transaction form (or modal)
```

**Global month filter:** Month selector in the navbar/header. Stored as URL param `?mes=YYYY-MM`. All pages read from this param and filter accordingly.

### Mobile (Expo 52)

Same screens, using bottom tab navigation:
- Tab 1: Dashboard
- Tab 2: Receitas
- Tab 3: Despesas
- Tab 4: Investimentos
- Tab 5: + (New transaction)

### Cards (per page)

- Total do mês
- Maior lançamento
- Quantidade de registros

### Tables (per page)

Columns: Data | Descrição | Categoria | Valor | Recorrente | Actions (edit/delete)

### New Transaction Form

Fields: tipo (receita/despesa/investimento) | categoria | descrição | valor | data | recorrente (toggle) | dia recorrente (if recurring)

---

## Security

- **Supabase RLS** enforces user isolation at the database level.
- All queries include `user_id` filter via Supabase Auth session.
- No sensitive data exposed to client beyond the authenticated user's own records.

---

## Out of Scope (YAGNI)

- Portfolio performance tracking / investment returns
- Multi-currency support
- Budget/goal setting
- Export to CSV/PDF
- Push notifications
- Charts/graphs (could be added later)
