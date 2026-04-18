import useSWR from 'swr'
import type { Product } from '@/lib/types'

interface UseProductsOptions {
  category?: string
  search?: string
  featured?: boolean
  sort?: string
  minPrice?: number | null
  maxPrice?: number | null
  page?: number
  limit?: number
}

interface ProductsResponse {
  products: Product[]
  total: number
  limit: number
  offset: number
}

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())
    .then((j) => j.data as ProductsResponse)

export function useProducts(options: UseProductsOptions = {}) {
  const { category, search, featured, sort, minPrice, maxPrice, page = 1, limit = 20 } = options

  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (search) params.set('search', search)
  if (featured) params.set('featured', 'true')
  if (sort && sort !== 'newest') params.set('sort', sort)
  if (minPrice != null && minPrice > 0) params.set('min_price', String(minPrice))
  if (maxPrice != null && maxPrice < 100000) params.set('max_price', String(maxPrice))
  params.set('page', String(page))
  params.set('limit', String(limit))

  const key = `/api/products?${params.toString()}`

  const { data, error, isLoading, mutate } = useSWR<ProductsResponse>(key, fetcher, {
    keepPreviousData: true,
    dedupingInterval: 30_000,
    revalidateOnFocus: true,
  })

  const totalPages = data ? Math.ceil(data.total / limit) : 0

  return {
    products: data?.products ?? [],
    total: data?.total ?? 0,
    totalPages,
    isLoading,
    error,
    mutate,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}
