import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ecrttmokkmaqdlsxhlvv.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjcnR0bW9ra21hcWRsc3hobHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTU2MzAsImV4cCI6MjA4ODc5MTYzMH0.cb8SIczUHH3a6hytKZsFCuQF1qEKT7CIbuoUScrgAE0'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
