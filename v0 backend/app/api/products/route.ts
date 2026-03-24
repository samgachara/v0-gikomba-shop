import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { productsQuerySchema } from '@/lib/api/schemas'
import { sanitizeSearchInput } from '@/lib/api/sanitize'
import { fail, ok } from '@/lib/api/response'

export async function GET(request: NextRequest) {
  try {
    const values = Object.fromEntries(request.nextUrl.searchParams.entries())
    const parsed = productsQuerySchema.safeParse(values)
    if (!parsed.success) return fail('Invalid query parameters', 400)

    const { category, featured, search, page, limit } = parsed.data
    const from = (page - 1) * limit
    const to = from + limit - 1

    const supabase = await createClient()
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (category && category !== 'all') query = query.eq('category', category)
    if (featured === 'true') query = query.eq('is_featured', true)

    if (search) {
      const sanitized = sanitizeSearchInput(search)
      if (sanitized.length > 0) {
        query = query.or(`name.ilike.%${sanitized}%,description.ilike.%${sanitized}%`)
      }
    }

    const { data, error, count } = await query
    if (error) return fail('Failed to fetch products', 500)

    return ok({
      items: data ?? [],
      pagination: { page, limit, total: count ?? 0 },
    })
  } catch {
    return fail('Internal server error', 500)
  }
}
