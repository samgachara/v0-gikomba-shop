import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, phone, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'seller' && profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Not a seller account' }, { status: 403 })
  }

  // Get full seller record
  const { data: seller, error } = await supabase
    .from('sellers')
    .select('id, store_name, description, phone, location, logo_url, verified, status, created_at')
    .eq('id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    ...seller,
    first_name: profile?.first_name,
    last_name:  profile?.last_name,
    role:       profile?.role,
    // Prefer seller phone, fallback to profile phone
    phone: seller?.phone || profile?.phone,
  })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { store_name, description, phone, location } = body

  // Update sellers table
  const sellerUpdates: Record<string, string> = {}
  if (store_name?.trim()) sellerUpdates.store_name = store_name.trim()
  if (description !== undefined) sellerUpdates.description = description
  if (phone?.trim()) sellerUpdates.phone = phone.trim().replace(/^0/, '254')
  if (location !== undefined) sellerUpdates.location = location

  if (Object.keys(sellerUpdates).length > 0) {
    const { error } = await supabase
      .from('sellers')
      .update(sellerUpdates)
      .eq('id', user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Also update profile phone if provided
  if (phone?.trim()) {
    await supabase
      .from('profiles')
      .update({ phone: phone.trim().replace(/^0/, '254') })
      .eq('id', user.id)
  }

  return NextResponse.json({ success: true })
}
