'use client'
export const dynamic = 'force-dynamic'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
// Legacy /seller/earnings — redirects to seller dashboard earnings tab
export default function SellerEarningsRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/dashboard/seller?tab=earnings') }, [router])
  return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
}
