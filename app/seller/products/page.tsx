'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Plus, Edit2, Trash2, Package } from 'lucide-react'
import type { Product } from '@/lib/types'

export default function SellerProducts() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'seller')) {
      router.push('/seller')
      return
    }

    if (!loading && user && profile?.role === 'seller') {
      fetchProducts()
    }
  }, [user, profile, loading, router])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/seller/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    setDeleting(productId)
    try {
      const res = await fetch(`/api/seller/products/${productId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setProducts(products.filter(p => p.id !== productId))
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    } finally {
      setDeleting(null)
    }
  }

  if (loading || loadingProducts) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Products</h1>
          <Link href="/seller/products/new">
            <Button>
              <Plus size={20} className="mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {products.length === 0 ? (
          <Card className="p-12 text-center">
            <Package size={48} className="mx-auto text-foreground/30 mb-4" />
            <p className="text-foreground/60 mb-4">You haven&apos;t added any products yet</p>
            <Link href="/seller/products/new">
              <Button>Add Your First Product</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {product.image_url && (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-foreground/60 mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-foreground/60">Price</p>
                      <p className="text-xl font-bold">KSh {product.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground/60">Stock</p>
                      <p className="text-xl font-bold">{product.stock}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/seller/products/${product.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit2 size={16} className="mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      disabled={deleting === product.id}
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      {deleting === product.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
