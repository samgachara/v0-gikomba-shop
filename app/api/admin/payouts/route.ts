import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleError } from '@/lib/api-error'
import { z } from 'zod'

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return user
}

// GET /api/admin/payouts — list all seller payouts
export async function GET() {
  try {
    const supabase = await createClient()
    const admin = await assertAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await supabase
      .from('seller_payouts')
      .select(`
        id, seller_id, amount, net_amount, commission_amount,
        status, mpesa_phone, mpesa_receipt, notes,
        period_start, period_end, created_at, updated_at,
        sellers ( store_name )
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data ?? [])
  } catch (error) {
    return handleError(error)
  }
}

const UpdatePayoutSchema = z.object({
  payout_id:     z.string().uuid(),
  status:        z.enum(['pending', 'processing', 'paid', 'failed']),
  mpesa_receipt: z.string().max(50).optional(),
  notes:         z.string().max(500).optional(),
})

// PATCH /api/admin/payouts — update payout status (process / mark paid)
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const admin = await assertAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { payout_id, status, mpesa_receipt, notes } = UpdatePayoutSchema.parse(body)

    const update: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
      processed_by: admin.id,
    }
    if (mpesa_receipt) update.mpesa_receipt = mpesa_receipt
    if (notes)         update.notes = notes
    if (status === 'paid') update.payout_date = new Date().toISOString()

    const { data, error } = await supabase
      .from('seller_payouts')
      .update(update)
      .eq('id', payout_id)
      .select()
      .single()

    if (error || !data) return NextResponse.json({ error: 'Payout not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch (error) {
    return handleError(error)
  }
}

// POST /api/admin/payouts — create a new payout for a seller
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const admin = await assertAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const CreatePayoutSchema = z.object({
      seller_id:          z.string().uuid(),
      amount:             z.number().positive(),
      commission_rate:    z.number().min(0).max(1).default(0.05),
      mpesa_phone:        z.string().optional(),
      notes:              z.string().max(500).optional(),
      period_start:       z.string().optional(),
      period_end:         z.string().optional(),
    })

    const body = await request.json()
    const parsed = CreatePayoutSchema.parse(body)
    const commission = Math.round(parsed.amount * parsed.commission_rate)
    const net = parsed.amount - commission

    const { data, error } = await supabase
      .from('seller_payouts')
      .insert({
        seller_id:         parsed.seller_id,
        amount:            parsed.amount,
        commission_amount: commission,
        net_amount:        net,
        status:            'pending',
        mpesa_phone:       parsed.mpesa_phone ?? null,
        notes:             parsed.notes ?? null,
        period_start:      parsed.period_start ?? null,
        period_end:        parsed.period_end ?? null,
        processed_by:      admin.id,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
