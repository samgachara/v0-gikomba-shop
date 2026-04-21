'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Loader2, Pencil, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Product } from '@/lib/types'

export default function SellerProductDetail() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loadingProduct, setLoadingProduct] = useState(true)

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'seller')) {
      router.push('/seller')
    }
  }, [user, profile, loading, router])

  useEffect(() => {
    if (!loading && user && profile?.role === 'seller') {
      fetch(`/api/seller/products/${productId}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { setProduct(data); setLoadingProduct(false) })
        .catch(() => setLoadingProduct(false))
    }
  }, [user, profile, loading, productId])

  if (loading || loadingProduct) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin" />
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/seller/products" className="flex items-center gap-2 text-blue-600 hover:underline">
            <ArrowLeft size={16} /> Back to Products
          </Link>
          <Link href={`/seller/products/${productId}/edit`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Pencil size={16} /> Edit Product
            </Button>
          </Link>
        </div>
        <div className="bg-white rounded-lg border p-8">
          {product.image_url && (
            <img src={product.image_url} alt={product.name} className="w-full max-h-64 object-contain rounded mb-6" />
          )}
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium">Price:</span> KSh {product.price?.toLocaleString()}</div>
            <div><span className="font-medium">Stock:</span> {product.stock}</div>
            <div><span className="font-medium">Category:</span> {product.category}</div>
            <div><span className="font-medium">Status:</span> {product.is_active ? 'Active' : 'Inactive'}</div>
          </div>
        </div>
      </main>
    </div>
  )
}
