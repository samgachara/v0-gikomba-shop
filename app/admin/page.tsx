'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// Legacy /admin route — redirects to the full admin dashboard at /dashboard/admin
export default function AdminRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/dashboard/admin') }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
