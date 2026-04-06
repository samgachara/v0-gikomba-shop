import { ok, fail, sanitizeSearch, parsePagination, getAuthUser } from '@/lib/api-handler'

const VALID_CATEGORIES = ['women', 'men', 'electronics', 'home', 'kids', 'accessories']
const VALID_SORTS = ['newest', 'price_asc', 'price_desc', 'popular']

export async function GET(request: Request) {
  const { supabase } = await getAuthUser()
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')
  const rawSearch = searchParams.get('search')
  const sort = searchParams.get('sort') || 'newest'
  const minPrice = searchParams.get('min_price')
  const maxPrice = searchParams.get('max_price')
  const { limit, offset } = parsePagination(searchParams)

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)

  // Sorting
  if (!VALID_SORTS.includes(sort)) return fail('Invalid sort', 400)
  if (sort === 'price_asc')  query = query.order('price', { ascending: true })
  else if (sort === 'price_desc') query = query.order('price', { ascending: false })
  else if (sort === 'popular') query = query.order('review_count', { ascending: false })
  else query = query.order('created_at', { ascending: false }) // newest

  // Filters
  if (category && category !== 'all') {
    if (!VALID_CATEGORIES.includes(category)) return fail('Invalid category', 400)
    query = query.eq('category', category)
  }
  if (featured === 'true') query = query.eq('is_featured', true)
  if (minPrice) query = query.gte('price', Number(minPrice))
  if (maxPrice) query = query.lte('price', Number(maxPrice))
  if (rawSearch) {
    const search = sanitizeSearch(rawSearch)
    if (search.length > 0)
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, error, count } = await query
  if (error) { console.error('[products/GET]', error.message); return fail('Failed to fetch products', 500) }
  return ok({ products: data, total: count, limit, offset })
}
