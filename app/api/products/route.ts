import { ok, fail, getAuthUser } from '@/lib/api-handler'
import { fetchShopProducts } from '@/lib/shop'

export async function GET(request: Request) {
  const { supabase } = await getAuthUser()
  const { searchParams } = new URL(request.url)
  const featured = searchParams.get('featured') === 'true'

  try {
    const result = await fetchShopProducts(supabase, {
      category: searchParams.get('category'),
      filter: searchParams.get('filter'),
      search: searchParams.get('search'),
      sort: searchParams.get('sort'),
      page: Number(searchParams.get('page') || '1'),
      limit: Number(searchParams.get('limit') || searchParams.get('per_page') || '12'),
    })

    if (featured) {
      result.products = result.products.filter((product) => product.is_featured)
      result.total = result.products.length
    }

    return ok(result)
  } catch (error) {
    console.error('[products/GET]', error)
    return fail('Failed to fetch products', 500)
  }
}
