'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Star, Package, MapPin } from 'lucide-react'
import type { Vendor, Product } from '@/lib/types'

export default function VendorProfile() {
  const params = useParams()
  const vendorId = params.id as string

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendor()
  }, [vendorId])

  const fetchVendor = async () => {
    try {
      const res = await fetch(`/api/vendors/${vendorId}`)
      if (res.ok) {
        const vendorData = await res.json()
        setVendor(vendorData)
        
        // Fetch vendor's products
        const productsRes = await fetch(`/api/products?vendor=${vendorId}`)
        if (productsRes.ok) {
          const productsData = await productsRes.json()
          setProducts(productsData.data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching vendor:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin" />
        </main>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Vendor Not Found</h1>
          <p className="text-foreground/60 mb-6">This vendor account does not exist</p>
          <Link href="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Vendor Header */}
        <div className="mb-12">
          <div className="flex gap-8 items-start mb-8">
            {vendor.shop_image_url && (
              <img 
                src={vendor.shop_image_url}
                alt={vendor.shop_name}
                className="w-24 h-24 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{vendor.shop_name}</h1>
              <p className="text-foreground/60 mb-4">{vendor.shop_description}</p>
              
              {/* Vendor Stats */}
              <div className="flex gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-500" size={20} />
                  <span className="font-medium">{vendor.rating.toFixed(1)} Rating</span>
                  <span className="text-foreground/60">({vendor.review_count} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="text-blue-600" size={20} />
                  <span className="font-medium">{vendor.total_orders} Orders</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Products from {vendor.shop_name}</h2>
          
          {products.length === 0 ? (
            <Card className="p-12 text-center">
              <Package size={48} className="mx-auto text-foreground/30 mb-4" />
              <p className="text-foreground/60">No products available</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-bold line-clamp-2 mb-2">{product.name}</h3>
                      <p className="text-sm text-foreground/60 mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-foreground/60">Price</p>
                          <p className="text-lg font-bold">KSh {product.price.toLocaleString()}</p>
                        </div>
                        {product.stock > 0 ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">In Stock</span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Out of Stock</span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
