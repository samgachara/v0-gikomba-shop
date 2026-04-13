'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'
import type { Vendor } from '@/lib/types'

export default function AdminDashboard() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading_data, setLoadingData] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/sign-in')
      return
    }

    if (!loading && user && profile?.role !== 'admin') {
      router.push('/')
      return
    }

    if (!loading && user && profile?.role === 'admin') {
      fetchVendors()
    }
  }, [user, profile, loading, router, filter])

  const fetchVendors = async () => {
    try {
      const url = filter === 'all' 
        ? '/api/admin/vendors'
        : `/api/admin/vendors?status=${filter}`
      
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setVendors(data)
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleApprove = async (vendorId: string) => {
    try {
      const res = await fetch('/api/admin/vendors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendorId,
          status: 'approved',
        }),
      })

      if (res.ok) {
        fetchVendors()
      }
    } catch (error) {
      console.error('Error approving vendor:', error)
    }
  }

  const handleReject = async (vendorId: string, reason: string) => {
    try {
      const res = await fetch('/api/admin/vendors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendorId,
          status: 'rejected',
          approval_reason: reason || 'Rejected by admin',
        }),
      })

      if (res.ok) {
        fetchVendors()
      }
    } catch (error) {
      console.error('Error rejecting vendor:', error)
    }
  }

  if (loading || (loading_data && user)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin" />
        </main>
      </div>
    )
  }

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-foreground/60">You do not have permission to access this page</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
          
          {/* Filter Tabs */}
          <div className="flex gap-4 mb-8">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status)
                  setLoadingData(true)
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-black text-white'
                    : 'bg-white text-black border border-gray-200 hover:border-gray-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Vendors List */}
        <div className="space-y-6">
          {vendors.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-foreground/60">No vendors found</p>
            </Card>
          ) : (
            vendors.map((vendor) => (
              <Card key={vendor.id} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-foreground/60">Shop Name</p>
                    <p className="font-bold text-lg">{vendor.shop_name}</p>
                    <p className="text-sm text-foreground/60 mt-2">{vendor.shop_description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60">Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      {vendor.status === 'pending' && <Clock size={20} className="text-yellow-600" />}
                      {vendor.status === 'approved' && <CheckCircle size={20} className="text-green-600" />}
                      {vendor.status === 'rejected' && <XCircle size={20} className="text-red-600" />}
                      <span className="font-medium capitalize">{vendor.status}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60">Created</p>
                    <p className="font-medium">{new Date(vendor.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60 mb-2">Actions</p>
                    {vendor.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(vendor.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(vendor.id, 'Does not meet requirements')}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    <Link href={`/admin/vendors/${vendor.id}`}>
                      <Button size="sm" variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
