import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database URL configuration for PostgreSQL (fallback)
export const getDatabaseUrl = () => {
  return process.env.DATABASE_URL || 'postgresql://localhost:5432/postgres';
};