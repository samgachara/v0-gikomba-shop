import type { Product } from '@/lib/types'

export const SHOP_CATEGORY_OPTIONS = [
  { value: 'all',            label: 'All' },
  { value: 'Clothing',       label: 'Clothing' },
  { value: 'Shoes',          label: 'Shoes' },
  { value: 'Accessories',    label: 'Accessories' },
  { value: 'Electronics',    label: 'Electronics' },
  { value: 'Home & Living',  label: 'Home & Living' },
  { value: 'Sports',         label: 'Sports' },
  { value: 'Beauty',         label: 'Beauty' },
  { value: 'Books',          label: 'Books' },
  { value: 'Other',          label: 'Other' },
]

export const SHOP_SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest' },
  { value: 'price_asc',  label: 'Price: Low' },
  { value: 'price_desc', label: 'Price: High' },
  { value: 'popular',    label: 'Top Rated' },
]

const CATEGORY_ALIASES: Record<string, string> = {
  // Legacy URL aliases → DB values
  'men':         'Clothing',
  'women':       'Clothing',
  'kids':        'Clothing',
  'accessories': 'Accessories',
  'electronics': 'Electronics',
  'home':        'Home & Living',
  // Direct DB value pass-through (already correct)
  'Clothing':      'Clothing',
  'Shoes':         'Shoes',
  'Accessories':   'Accessories',
  'Electronics':   'Electronics',
  'Home & Living': 'Home & Living',
  'Sports':        'Sports',
  'Beauty':        'Beauty',
  'Books':         'Books',
  'Other':         'Other',
}

const VALID_CATEGORIES = new Set(SHOP_CATEGORY_OPTIONS.map((option) => option.value))
const VALID_FILTERS = new Set(['new', 'bestsellers', 'sale'])
const VALID_SORTS = new Set(SHOP_SORT_OPTIONS.map((option) => option.value))

export interface ShopQueryInput {
  category?: string | null
  filter?: string | null
  search?: string | null
  sort?: string | null
  page?: number | null
  limit?: number | null
}

export interface ShopQueryState {
  category: string
  filter?: 'new' | 'bestsellers' | 'sale'
  search: string
  sort: string
  page: number
  limit: number
}

export interface ShopProductsResult {
  products: Product[]
  total: number
  limit: number
  offset: number
  page: number
}

function sanitizeSearchInput(input: string) {
  return input
    .trim()
    .slice(0, 100)
    .replace(/[%_\\]/g, (char) => `\\${char}`)
    .replace(/['";`]/g, '')
}

function normalizeCategory(category?: string | null) {
  if (!category || category === 'all') return 'all'
  // Try alias lookup first, then check if it's already a valid value
  const resolved = CATEGORY_ALIASES[category] ?? category
  return VALID_CATEGORIES.has(resolved) ? resolved : 'all'
}

function normalizeFilter(filter?: string | null): ShopQueryState['filter'] {
  if (!filter || !VALID_FILTERS.has(filter)) return undefined
  return filter as ShopQueryState['filter']
}

export function normalizeShopQuery(input: ShopQueryInput): ShopQueryState {
  const category = normalizeCategory(input.category)
  const filter = normalizeFilter(input.filter)
  const search = sanitizeSearchInput(input.search ?? '')
  const parsedPage = Number.isFinite(input.page) ? Number(input.page) : 1
  const page = Math.max(1, parsedPage || 1)
  const parsedLimit = Number.isFinite(input.limit) ? Number(input.limit) : 12
  const limit = Math.min(Math.max(parsedLimit || 12, 1), 48)

  let sort = input.sort && VALID_SORTS.has(input.sort) ? input.sort : 'newest'
  if (!input.sort && filter === 'bestsellers') {
    sort = 'popular'
  }

  return {
    category,
    filter,
    search,
    sort,
    page,
    limit,
  }
}

export async function fetchShopProducts(
  supabase: any,
  input: ShopQueryInput,
): Promise<ShopProductsResult> {
  const queryState = normalizeShopQuery(input)
  const offset = (queryState.page - 1) * queryState.limit

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .range(offset, offset + queryState.limit - 1)
    .eq('is_active', true)

  if (queryState.category !== 'all') {
    query = query.eq('category', queryState.category)
  }

  if (queryState.search) {
    query = query.or(`name.ilike.%${queryState.search}%,description.ilike.%${queryState.search}%`)
  }

  if (queryState.filter === 'new') {
    query = query.eq('is_new', true)
  }

  if (queryState.filter === 'sale') {
    query = query.not('original_price', 'is', null).gt('original_price', 0)
  }

  if (queryState.sort === 'price_asc') {
    query = query.order('price', { ascending: true })
  } else if (queryState.sort === 'price_desc') {
    query = query.order('price', { ascending: false })
  } else if (queryState.sort === 'popular') {
    query = query.order('review_count', { ascending: false, nullsFirst: false })
    query = query.order('rating', { ascending: false, nullsFirst: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error, count } = await query

  if (error) {
    throw error
  }

  return {
    products: (data ?? []) as Product[],
    total: count ?? 0,
    limit: queryState.limit,
    offset,
    page: queryState.page,
  }
}
