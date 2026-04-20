'use client'
export const dynamic = 'force-dynamic'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
// Legacy /seller route — redirects to full seller dashboard
export default function SellerRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/dashboard/seller') }, [router])
  return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
}
