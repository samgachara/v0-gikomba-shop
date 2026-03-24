import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase browser client.
 * Returns null if Supabase credentials are not configured.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Return null if Supabase is not configured
  if (!supabaseUrl || !supabaseKey) {
    return null
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
