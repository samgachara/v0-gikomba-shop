'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Package, Heart, LogOut, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/header'
import type { Profile } from '@/lib/types'

export default function AccountPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user) fetchProfile()
  }, [user, authLoading, router])

  const fetchProfile = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single()

    if (error) {
      toast.error('Failed to load profile')
      setLoading(false)
      return
    }

    if (data) {
      setProfile(data)
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
      })
    }

    setLoading(false)
  }

  const handleSave = async () => {
    // Basic validation
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error('First and last name are required')
      return
    }

    if (formData.phone && !/^\+?[0-9\s\-().]{7,20}$/.test(formData.phone)) {
      toast.error('Please enter a valid phone number')
      return
    }

    setSaving(true)

    const supabase = createClient()
    const { error } = await supabase.from('profiles').upsert({
      id: user!.id,
      ...formData,
      updated_at: new Date().toISOString(),
    })

    setSaving(false)

    if (error) {
      toast.error('Failed to save profile. Please try again.')
      return
    }

    toast.success('Profile updated successfully')
  }

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-8">
          <div className="mx-auto max-w-4xl px-4">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!user) return null

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="text-3xl font-bold mb-8">My Account</h1>
          <div className="grid gap-6 md:grid-cols-3">

            {/* Sidebar */}
            <div className="md:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    <Button variant="secondary" className="w-full justify-start gap-2" asChild>
                      <Link href="/account">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                      <Link href="/account/orders">
                        <Package className="h-4 w-4" />
                        Orders
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                      <Link href="/wishlist">
                        <Heart className="h-4 w-4" />
                        Wishlist
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                      onClick={signOut}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Profile Form */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal details and delivery address
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) =>
                          setFormData({ ...formData, first_name: e.target.value })
                        }
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) =>
                          setFormData({ ...formData, last_name: e.target.value })
                        }
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed here
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Street address, building, floor"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder="Nairobi"
                    />
                  </div>

                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
