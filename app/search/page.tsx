'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Loader2, ShoppingBag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useCart } from '@/lib/cart-context'
import { cn } from '@/lib/utils'

function fmt(n: number) { return `KSh ${Number(n).toLocaleString()}` }

function SearchResults() {
  const searchParams  = useSearchParams()
  const router        = useRouter()
  const q             = searchParams.get('q') ?? ''
  const [query,    setQuery]    = useState(q)
  const [results,  setResults]  = useState<any[]>([])
  const [loading,  setLoading]  = useState(false)
  const { addToCart } = useCart()

  useEffect(() => { setQuery(q) }, [q])

  useEffect(() => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    fetch(`/api/products?search=${encodeURIComponent(q)}&limit=24`)
      .then(r => r.json())
      .then(d => setResults(d?.products ?? []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [q])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products..."
            className="pl-9 h-11"
            autoFocus
          />
        </div>
        <Button type="submit" className="h-11 px-6">Search</Button>
      </form>

      {/* State: no query */}
      {!q.trim() && (
        <div className="text-center py-20">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Type something to search products</p>
        </div>
      )}

      {/* State: loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* State: no results */}
      {!loading && q.trim() && results.length === 0 && (
        <div className="text-center py-20">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No results for "{q}"</h2>
          <p className="text-muted-foreground mb-6">Try different keywords or browse the shop</p>
          <Button asChild><Link href="/shop">Browse All Products</Link></Button>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {results.length} result{results.length !== 1 ? 's' : ''} for "<strong>{q}</strong>"
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map(p => (
              <Link key={p.id} href={`/product/${p.id}`}
                className="group rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow bg-card">
                <div className="relative aspect-[3/4]">
                  <Image src={p.image_url || '/placeholder.jpg'} alt={p.name || p.title}
                    fill className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width:640px) 50vw, 25vw" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium line-clamp-1">{p.name || p.title}</p>
                  <p className="text-sm font-bold text-primary mt-1">{fmt(p.price)}</p>
                  {p.sellers?.store_name && (
                    <p className="text-xs text-muted-foreground mt-0.5">{p.sellers.store_name}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <Suspense fallback={<div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
          <SearchResults />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
