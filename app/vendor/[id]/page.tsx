'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Package, MapPin, ShieldCheck, MessageCircle } from 'lucide-react'
import type { Product } from '@/lib/types'

interface Seller {
  id: string
  store_name: string
  description: string | null
  logo_url: string | null
  location: string | null
  verified: boolean
  created_at: string
  products: Product[]
}

function fmt(n: number) { return `KSh ${n.toLocaleString()}` }

export default function SellerStorePage() {
  const params = useParams()
  const sellerId = params.id as string

  const [seller, setSeller]   = useState<Seller | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/sellers/${sellerId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setSeller(data)
        else setNotFound(true)
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [sellerId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </main>
      </div>
    )
  }

  if (notFound || !seller) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex flex-col items-center justify-center h-96 gap-4">
          <Package className="h-12 w-12 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Seller not found</h1>
          <p className="text-muted-foreground">This store doesn't exist or is no longer active.</p>
          <Button asChild><Link href="/shop">Browse Products</Link></Button>
        </main>
      </div>
    )
  }

  const waNumber = '254736906440'
  const waMsg = encodeURIComponent(`Hi ${seller.store_name}! I found your store on gikomba.shop and I'm interested in your products.`)
  const activeProducts = (seller.products ?? []).filter(p => p.is_active !== false)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-12">

        {/* Store header */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border p-8 mb-8 flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-3xl font-bold text-primary">
            {seller.logo_url
              ? <img src={seller.logo_url} alt={seller.store_name} className="w-full h-full object-cover rounded-2xl" />
              : seller.store_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold">{seller.store_name}</h1>
              {seller.verified && (
                <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="h-3 w-3" />Verified Seller
                </span>
              )}
            </div>
            {seller.location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                <MapPin className="h-3 w-3" />{seller.location}
              </p>
            )}
            {seller.description && (
              <p className="text-sm text-muted-foreground mb-4">{seller.description}</p>
            )}
            <div className="flex items-center gap-3">
              <Badge variant="outline">{activeProducts.length} product{activeProducts.length !== 1 ? 's' : ''}</Badge>
              <a
                href={`https://wa.me/${waNumber}?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#25D366' }}
              >
                <MessageCircle className="h-4 w-4" />
                Chat with Seller
              </a>
            </div>
          </div>
        </div>

        {/* Products grid */}
        <h2 className="text-xl font-semibold mb-4">Products from {seller.store_name}</h2>
        {activeProducts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-3" />
            <p>This seller hasn't listed any products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {activeProducts.map(product => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
                  <div className="aspect-square bg-muted overflow-hidden">
                    {product.image_url
                      ? <img src={product.image_url} alt={product.title || product.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Package className="h-8 w-8 text-muted-foreground" /></div>}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium line-clamp-2">{product.title || product.name}</p>
                    <p className="text-sm font-bold mt-1">{fmt(product.price)}</p>
                    {product.stock === 0 && <p className="text-xs text-red-500 mt-0.5">Out of stock</p>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
