'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Plus, Package, TrendingUp } from 'lucide-react'
import type { Vendor } from '@/lib/types'

export default function SellerDashboard() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loadingVendor, setLoadingVendor] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/sign-in')
      return
    }

    if (!loading && user && profile?.role === 'seller') {
      const fetchVendor = async () => {
        try {
          const res = await fetch('/api/vendors/me')
          if (res.ok) {
            const data = await res.json()
            setVendor(data)
          }
        } catch (error) {
          console.error('Error fetching vendor:', error)
        } finally {
          setLoadingVendor(false)
        }
      }

      fetchVendor()
    }
  }, [user, profile, loading, router])

  if (loading || loadingVendor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin" />
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in required</h1>
          <p className="text-foreground/60 mb-6">Please sign in to access the seller dashboard</p>
          <Link href="/auth/sign-in">
            <Button>Sign In</Button>
          </Link>
        </main>
      </div>
    )
  }

  if (profile?.role !== 'seller') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Become a Seller</h1>
          <p className="text-foreground/60 mb-6">Create a vendor account to start selling</p>
          <Link href="/seller/register">
            <Button>Register as Seller</Button>
          </Link>
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
          <p className="text-foreground/60">Your vendor account could not be loaded</p>
        </main>
      </div>
    )
  }

  const isApproved = vendor.status === 'approved'

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-2">{vendor.shop_name}</h1>
          <p className="text-foreground/60">{vendor.shop_description}</p>
          {vendor.status === 'pending' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">Your vendor account is pending approval. You will be able to add products once approved.</p>
            </div>
          )}
          {vendor.status === 'rejected' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">Your vendor account was rejected. Reason: {vendor.approval_reason}</p>
            </div>
          )}
        </div>

        {/* Stats */}
        {isApproved && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60">Total Earnings</p>
                  <p className="text-2xl font-bold">KSh {vendor.total_earnings.toLocaleString()}</p>
                </div>
                <TrendingUp className="text-green-600" size={32} />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60">Total Orders</p>
                  <p className="text-2xl font-bold">{vendor.total_orders}</p>
                </div>
                <Package className="text-blue-600" size={32} />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60">Shop Rating</p>
                  <p className="text-2xl font-bold">{vendor.rating.toFixed(1)} ⭐</p>
                  <p className="text-xs text-foreground/60">({vendor.review_count} reviews)</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Actions */}
        {isApproved && (
          <div className="mb-12 flex gap-4">
            <Link href="/seller/products">
              <Button>View Products</Button>
            </Link>
            <Link href="/seller/products/new">
              <Button variant="outline">
                <Plus size={20} className="mr-2" />
                Add Product
              </Button>
            </Link>
            <Link href="/seller/orders">
              <Button variant="outline">View Orders</Button>
            </Link>
            <Link href="/seller/earnings">
              <Button variant="outline">View Earnings</Button>
            </Link>
            <Link href="/seller/settings">
              <Button variant="outline">Settings</Button>
            </Link>
          </div>
        )}

        {/* Shop Info */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Shop Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-foreground/60">Status</p>
              <p className="font-medium capitalize">{vendor.status}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/60">Created</p>
              <p className="font-medium">{new Date(vendor.created_at).toLocaleDateString()}</p>
            </div>
            {isApproved && (
              <Link href="/seller/settings">
                <Button variant="outline" size="sm">Edit Shop Info</Button>
              </Link>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}
