import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ecrttmokkmaqdlsxhlvv.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjcnR0bW9ra21hcWRsc3hobHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTU2MzAsImV4cCI6MjA4ODc5MTYzMH0.cb8SIczUHH3a6hytKZsFCuQF1qEKT7CIbuoUScrgAE0'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // Called from a Server Component — middleware handles session refresh
        }
      },
    },
  })
}
