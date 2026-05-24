import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

type Props = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  return {
    title: 'Join gikomba.shop — Get KSh 100 credit on your first purchase',
    description: `You've been invited to shop on gikomba.shop. Sign up with code ${code} and your friend earns KSh 100 when you make your first purchase.`,
  }
}

export default async function ReferralPage({ params }: Props) {
  const { code } = await params
  const supabase  = await createClient()

  // Validate the code exists
  const { data: referralCode } = await supabase
    .from('referral_codes')
    .select('user_id, profiles(first_name)')
    .eq('code', code.toUpperCase())
    .single()

  if (!referralCode) {
    // Invalid code — redirect to homepage
    redirect('/')
  }

  // Valid code — redirect to signup with code in URL
  redirect(`/auth/sign-up?ref=${code.toUpperCase()}`)
}
