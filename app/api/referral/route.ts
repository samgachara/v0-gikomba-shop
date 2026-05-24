import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/referral — get current user's referral code, stats, and credit balance
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get or create referral code
  const { data: code } = await supabase.rpc('get_or_create_referral_code', { p_user_id: user.id })

  // Get referral stats
  const { data: referrals } = await supabase
    .from('referrals')
    .select('id, status, reward_amount, created_at, rewarded_at')
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false })

  // Get credit balance
  const { data: credits } = await supabase
    .from('store_credits')
    .select('balance')
    .eq('user_id', user.id)
    .single()

  const total    = (referrals ?? []).length
  const rewarded = (referrals ?? []).filter(r => r.status === 'rewarded').length
  const pending  = (referrals ?? []).filter(r => r.status === 'pending').length
  const earned   = (referrals ?? []).filter(r => r.status === 'rewarded').reduce((s, r) => s + r.reward_amount, 0)

  return NextResponse.json({
    code,
    referral_url: `https://gikomba.shop/ref/${code}`,
    stats: { total, rewarded, pending, earned },
    balance: credits?.balance ?? 0,
    referrals: referrals ?? [],
  })
}

// POST /api/referral — apply a referral code (called at signup or manually)
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = await request.json()
  if (!code?.trim()) return NextResponse.json({ error: 'Code required' }, { status: 400 })

  const { data, error } = await supabase.rpc('apply_referral', {
    p_referred_id: user.id,
    p_code: code.trim().toUpperCase(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data.success) return NextResponse.json({ error: data.error }, { status: 400 })

  return NextResponse.json({ success: true, message: 'Referral code applied! Your friend will earn KSh 100 when you make your first purchase.' })
}
