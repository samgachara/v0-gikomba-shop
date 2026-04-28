import type { Metadata } from 'next'
import { generateShopMetadata } from './metadata'
import ShopContent from './ShopContent'
import { createClient } from '@/lib/supabase/server'
import { fetchShopProducts, normalizeShopQuery } from '@/lib/shop'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; category?: string }>
}): Promise<Metadata> {
  const { filter, category } = await searchParams
  return generateShopMetadata(filter, category)
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    filter?: string
    category?: string
    search?: string
    sort?: string
    page?: string
  }>
}) {
  const resolvedSearchParams = await searchParams
  const initialState = normalizeShopQuery({
    category: resolvedSearchParams.category,
    filter: resolvedSearchParams.filter,
    search: resolvedSearchParams.search,
    sort: resolvedSearchParams.sort,
    page: Number(resolvedSearchParams.page || '1'),
    limit: 12,
  })
  const supabase = await createClient()
  const initialData = await fetchShopProducts(supabase, initialState)

  return (
    <ShopContent
      initialData={initialData}
      initialState={initialState}
    />
  )
}
