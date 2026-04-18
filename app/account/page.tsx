'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User, Package, Heart, LogOut, Loader2,
  MapPin, Phone, Mail, ShoppingBag, Star,
  HeadphonesIcon, ChevronRight, CheckCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/header'
import type { Profile } from '@/lib/types'

const CITIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
  'Thika', 'Kitale', 'Malindi', 'Garissa', 'Kakamega',
  'Nyeri', 'Meru', 'Kericho', 'Machakos', 'Embu',
]

export default function AccountPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saving,  setSaving]    = useState(false)
  const [tab,     setTab]       = useState<'overview' | 'profile' | 'addresses' | 'support'>('overview')

  // Quick stats for overview
  const [orderCount,   setOrderCount]   = useState<number | null>(null)
  const [wishlistCount, setWishlistCount] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', phone: '', address: '', city: '',
  })

  // Support form
  const [supportForm, setSupportForm] = useState({ subject: '', message: '' })
  const [supportSent,  setSupportSent]  = useState(false)
  const [supportSending, setSupportSending] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth/login'); return }
    if (user) fetchAll()
  }, [user, authLoading, router])

  const fetchAll = async () => {
    const supabase = createClient()

    const [{ data: profileData }, { count: orders }, { count: wishlist }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user!.id).single(),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('buyer_id', user!.id),
      supabase.from('wishlist_items').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
    ])

    if (profileData) {
      setProfile(profileData)
      setFormData({
        first_name: profileData.first_name || '',
        last_name:  profileData.last_name  || '',
        phone:      profileData.phone      || '',
        address:    profileData.address    || '',
        city:       profileData.city       || '',
      })
    }
    setOrderCount(orders ?? 0)
    setWishlistCount(wishlist ?? 0)
    setLoading(false)
  }

  const handleSave = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error('First and last name are required'); return
    }
    if (formData.phone && !/^\+?[0-9\s\-().]{7,20}$/.test(formData.phone)) {
      toast.error('Please enter a valid phone number'); return
    }
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').upsert({
      id: user!.id, ...formData, updated_at: new Date().toISOString(),
    })
    setSaving(false)
    if (error) { toast.error('Failed to save profile. Please try again.'); return }
    toast.success('Profile updated successfully')
  }

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supportForm.subject.trim() || !supportForm.message.trim()) {
      toast.error('Please fill in subject and message'); return
    }
    setSupportSending(true)
    const supabase = createClient()
    const { error } = await supabase.from('contact_submissions').insert({
      name:    `${formData.first_name} ${formData.last_name}`.trim() || user!.email,
      email:   user!.email,
      subject: supportForm.subject,
      message: supportForm.message,
    })
    setSupportSending(false)
    if (error) { toast.error('Failed to send. Please try again.'); return }
    setSupportSent(true)
    setSupportForm({ subject: '', message: '' })
    setTimeout(() => setSupportSent(false), 4000)
  }

  if (authLoading || loading) {
    return (
      <><Header />
        <main className="min-h-screen bg-background py-8">
          <div className="mx-auto max-w-4xl px-4 flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </>
    )
  }
  if (!user) return null

  const displayName = [formData.first_name, formData.last_name].filter(Boolean).join(' ') || 'Shopper'

  return (
    <><Header />
      <main className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="text-3xl font-bold mb-8">My Account</h1>

          <div className="grid gap-6 md:grid-cols-3">

            {/* Sidebar nav */}
            <div className="md:col-span-1 space-y-3">
              <Card>
                <CardContent className="p-4">
                  {/* Avatar / name */}
                  <div className="flex items-center gap-3 mb-4 px-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <Separator className="mb-3" />
                  <nav className="space-y-1">
                    {[
                      { id: 'overview',   label: 'Overview',   icon: User },
                      { id: 'profile',    label: 'Profile',    icon: User },
                      { id: 'addresses',  label: 'Addresses',  icon: MapPin },
                      { id: 'support',    label: 'Support',    icon: HeadphonesIcon },
                    ].map(({ id, label, icon: Icon }) => (
                      <Button
                        key={id}
                        variant={tab === id ? 'secondary' : 'ghost'}
                        className="w-full justify-start gap-2"
                        onClick={() => setTab(id as typeof tab)}
                      >
                        <Icon className="h-4 w-4" />{label}
                      </Button>
                    ))}
                    <Separator className="my-1" />
                    <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                      <Link href="/account/orders"><Package className="h-4 w-4" />My Orders</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                      <Link href="/wishlist"><Heart className="h-4 w-4" />Wishlist</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive" onClick={signOut}>
                      <LogOut className="h-4 w-4" />Sign Out
                    </Button>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main content */}
            <div className="md:col-span-2 space-y-4">

              {/* ── OVERVIEW ── */}
              {tab === 'overview' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Welcome back, {formData.first_name || 'there'}!</h2>

                  {/* Quick stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{orderCount ?? '—'}</p>
                          <p className="text-xs text-muted-foreground">Total Orders</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Heart className="h-5 w-5 text-pink-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{wishlistCount ?? '—'}</p>
                          <p className="text-xs text-muted-foreground">Wishlist Items</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick links */}
                  <Card>
                    <CardHeader><CardTitle className="text-base">Quick Links</CardTitle></CardHeader>
                    <CardContent className="p-0">
                      {[
                        { label: 'View all orders',         sub: 'Track your purchases',         href: '/account/orders',  icon: Package },
                        { label: 'My wishlist',             sub: 'Products you saved',           href: '/wishlist',        icon: Heart },
                        { label: 'Browse new arrivals',     sub: 'Shop the latest items',        href: '/shop?filter=new', icon: Star },
                        { label: 'Contact support',         sub: 'Get help with your orders',    tab: 'support',           icon: HeadphonesIcon },
                      ].map((item, i, arr) => (
                        <div key={item.label}>
                          {'href' in item ? (
                            <Link href={item.href} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                              <item.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{item.label}</p>
                                <p className="text-xs text-muted-foreground">{item.sub}</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </Link>
                          ) : (
                            <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left" onClick={() => setTab('support')}>
                              <item.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{item.label}</p>
                                <p className="text-xs text-muted-foreground">{item.sub}</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </button>
                          )}
                          {i < arr.length - 1 && <Separator />}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Profile completeness nudge */}
                  {(!formData.phone || !formData.address || !formData.city) && (
                    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                      <CardContent className="p-4 flex items-start gap-3">
                        <User className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Complete your profile</p>
                          <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                            Add your phone and delivery address for faster checkout.
                          </p>
                        </div>
                        <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100 shrink-0" onClick={() => setTab('profile')}>
                          Update
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* ── PROFILE ── */}
              {tab === 'profile' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First Name</Label>
                        <Input id="first_name" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input id="last_name" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} placeholder="Doe" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email" value={user.email || ''} disabled className="bg-muted pl-9" />
                      </div>
                      <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+254 7XX XXX XXX" className="pl-9" />
                      </div>
                    </div>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* ── ADDRESSES ── */}
              {tab === 'addresses' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Address</CardTitle>
                    <CardDescription>Your default delivery address for orders</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Street address, building, floor" className="pl-9" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <select
                        id="city"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                      >
                        <option value="">Select your city</option>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    {formData.address && formData.city && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                        Default address: {formData.address}, {formData.city}
                      </div>
                    )}
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save Address'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* ── SUPPORT ── */}
              {tab === 'support' && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Support</CardTitle>
                      <CardDescription>Having an issue? Send us a message and we'll get back to you.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {supportSent ? (
                        <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-lg">
                          <CheckCircle className="h-5 w-5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Message sent!</p>
                            <p className="text-sm">We'll get back to you within 24 hours.</p>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleSupportSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="support-email">Your Email</Label>
                            <Input id="support-email" value={user.email || ''} disabled className="bg-muted" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="subject">Subject *</Label>
                            <select
                              id="subject"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              value={supportForm.subject}
                              onChange={e => setSupportForm(f => ({ ...f, subject: e.target.value }))}
                            >
                              <option value="">Select a topic</option>
                              <option value="Order issue">Order issue</option>
                              <option value="Payment problem">Payment problem</option>
                              <option value="Product question">Product question</option>
                              <option value="Return or refund">Return or refund</option>
                              <option value="Account help">Account help</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="support-message">Message *</Label>
                            <textarea
                              id="support-message"
                              rows={5}
                              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                              placeholder="Describe your issue in detail..."
                              value={supportForm.message}
                              onChange={e => setSupportForm(f => ({ ...f, message: e.target.value }))}
                            />
                          </div>
                          <Button type="submit" disabled={supportSending} className="gap-2">
                            {supportSending ? <><Loader2 className="h-4 w-4 animate-spin" />Sending...</> : 'Send Message'}
                          </Button>
                        </form>
                      )}
                    </CardContent>
                  </Card>

                  {/* Help links */}
                  <Card>
                    <CardHeader><CardTitle className="text-base">Quick Help</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p>📞 Call us: <a href="tel:+254736906440" className="text-primary hover:underline font-medium">+254 736 906 440</a></p>
                      <p>📧 Email: <a href="mailto:support@gikomba.shop" className="text-primary hover:underline font-medium">support@gikomba.shop</a></p>
                      <p className="text-muted-foreground">Mon–Fri 8am–6pm · Sat 9am–3pm</p>
                    </CardContent>
                  </Card>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </>
  )
}
