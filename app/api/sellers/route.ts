import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { RegisterSellerSchema } from '@/lib/validations'
import { handleError, logInfo } from '@/lib/api-error'

// GET /api/sellers — public list of active sellers
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit  = Math.min(parseInt(searchParams.get('limit')  || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const supabase = await createClient()

    const { data, error, count } = await supabase
      .from('sellers')
      .select('id, store_name, description, logo_url, location, verified, created_at', { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return NextResponse.json({ data, pagination: { total: count, limit, offset } })
  } catch (error) {
    return handleError(error)
  }
}

// POST /api/sellers — register as a seller (authenticated user only)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // If already a seller record, just redirect them
    const { data: existing } = await supabase.from('sellers').select('id').eq('id', user.id).single()
    if (existing) {
      // Update profile role just in case it was buyer
      await supabase.from('profiles').update({ role: 'seller' }).eq('id', user.id)
      return NextResponse.json({ id: existing.id, message: 'Already registered' }, { status: 200 })
    }

    const body = await request.json()
    // Support both 'phone' and 'mpesa_phone' field names from the form
    const normalizedBody = { ...body, phone: body.phone || body.mpesa_phone }
    const { store_name, description, phone, location, logo_url } = RegisterSellerSchema.parse(normalizedBody)

    logInfo('Registering seller', { user_id: user.id, store_name })

    // Check store_name uniqueness
    const { data: nameTaken } = await supabase.from('sellers').select('id').eq('store_name', store_name).single()
    if (nameTaken) return NextResponse.json({ error: 'Store name is already taken' }, { status: 409 })

    // Insert seller row
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .insert({ id: user.id, store_name, description, phone, location, logo_url, status: 'active', verified: false })
      .select()
      .single()
    if (sellerError) throw sellerError

    // Update profile role to 'seller'
    await supabase.from('profiles').update({ role: 'seller' }).eq('id', user.id)

    logInfo('Seller registered', { seller_id: seller.id, store_name })
    return NextResponse.json(seller, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
