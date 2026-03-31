import { ok, fail, sanitizeSearch, parsePagination, getAuthUser } from '@/lib/api-handler'

const VALID_CATEGORIES = ['women', 'men', 'electronics', 'home', 'kids', 'accessories']

export async function GET(request: Request) {
  const { supabase } = await getAuthUser()
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')
  const rawSearch = searchParams.get('search')
  const { limit, offset } = parsePagination(searchParams)

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category && category !== 'all') {
    if (!VALID_CATEGORIES.includes(category)) return fail('Invalid category', 400)
    query = query.eq('category', category)
  }
  if (featured === 'true') query = query.eq('is_featured', true)
  if (rawSearch) {
    const search = sanitizeSearch(rawSearch)
    if (search.length > 0)
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, error, count } = await query
  if (error) { console.error('[products/GET]', error.message); return fail('Failed to fetch products', 500) }
  return ok({ products: data, total: count, limit, offset })
}
