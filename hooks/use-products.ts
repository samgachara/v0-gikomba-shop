import useSWR from 'swr'
import type { Product } from '@/lib/types'

interface UseProductsOptions {
  category?: string
  search?: string
  featured?: boolean
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
  const { category, search, featured, page = 1, limit = 20 } = options

  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (search) params.set('search', search)
  if (featured) params.set('featured', 'true')
  params.set('page', String(page))
  params.set('limit', String(limit))

  const key = `/api/products?${params.toString()}`

  const { data, error, isLoading, mutate } = useSWR<ProductsResponse>(key, fetcher, {
    // Keep previous data while fetching new page — no flicker
    keepPreviousData: true,
    // Cache for 30 seconds — products don't change that fast
    dedupingInterval: 30_000,
    // Revalidate when window refocuses
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
