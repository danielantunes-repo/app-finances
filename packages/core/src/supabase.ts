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
