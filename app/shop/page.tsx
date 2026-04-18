import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import SearchParamsWrapper from './SearchParamsWrapper'
import type { Metadata } from 'next'
import { generateShopMetadata } from './metadata'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; category?: string }>
}): Promise<Metadata> {
  const { filter, category } = await searchParams
  return generateShopMetadata(filter, category)
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SearchParamsWrapper />
    </Suspense>
  )
}
