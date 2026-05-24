'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, Gift, Users, Star, TrendingUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

function fmt(n: number) { return `KSh ${Number(n).toLocaleString()}` }

export default function ReferralPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied]   = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) return
    fetch('/api/referral')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user])

  const copyLink = async () => {
    if (!data?.referral_url) return
    await navigator.clipboard.writeText(data.referral_url)
    setCopied(true)
    toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLink = () => {
    if (!data?.referral_url) return
    const text = `Shop on gikomba.shop — Kenya's trusted online marketplace. Use my link to sign up: ${data.referral_url}`
    if (navigator.share) {
      navigator.share({ title: 'gikomba.shop', text, url: data.referral_url }).catch(() => {})
    } else {
      copyLink()
    }
  }

  if (authLoading || loading) return (
    <div className="min-h-screen bg-background"><Header />
      <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Refer & Earn</h1>
          <p className="text-muted-foreground">Share gikomba.shop with friends. Earn <strong>KSh 100</strong> store credit every time someone you refer makes their first purchase.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: Users,     label: 'Total Referrals', value: data?.stats?.total ?? 0 },
            { icon: Star,      label: 'Rewarded',        value: data?.stats?.rewarded ?? 0 },
            { icon: TrendingUp,label: 'Total Earned',    value: fmt(data?.stats?.earned ?? 0) },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label}>
              <CardContent className="p-4 text-center">
                <Icon className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Credit balance */}
        {(data?.balance ?? 0) > 0 && (
          <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardContent className="p-4 flex items-center gap-3">
              <Gift className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800 dark:text-green-400">You have {fmt(data.balance)} in store credit</p>
                <p className="text-xs text-green-700 dark:text-green-500">Applied automatically at checkout</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Referral link */}
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Your Referral Link</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <code className="flex-1 text-sm font-mono truncate">{data?.referral_url ?? '...'}</code>
              <Button size="sm" variant="ghost" onClick={copyLink} className="flex-shrink-0">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={shareLink}>Share Link</Button>
              <Button variant="outline" className="flex-1" asChild>
                <a href={`https://wa.me/?text=${encodeURIComponent(`Shop on gikomba.shop — Kenya's trusted online marketplace. Use my link: ${data?.referral_url}`)}`}
                   target="_blank" rel="noopener noreferrer">Share on WhatsApp</a>
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Your code: <strong className="font-mono tracking-widest">{data?.code ?? '...'}</strong>
            </p>
          </CardContent>
        </Card>

        {/* How it works */}
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">How It Works</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { step: '1', text: 'Share your unique referral link with friends, family, or on social media' },
                { step: '2', text: 'They sign up on gikomba.shop using your link' },
                { step: '3', text: 'When they make their first purchase, you earn KSh 100 store credit' },
                { step: '4', text: 'Use your credit as a discount on your next order — no limit on referrals' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{step}</div>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Referral history */}
        {(data?.referrals ?? []).length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Referral History</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.referrals.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">Referral #{r.id.slice(0,8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.status === 'rewarded' ? 'bg-green-100 text-green-700' :
                        r.status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{r.status}</span>
                      {r.status === 'rewarded' && <p className="text-xs text-green-600 font-medium mt-0.5">+{fmt(r.reward_amount)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  )
}
