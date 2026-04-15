import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { RegisterSellerSchema } from '@/lib/validations'
import { handleError, logInfo } from '@/lib/api-error'

// GET /api/sellers — public list of approved sellers
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createClient()

    const { data, error, count } = await supabase
      .from('sellers')
      .select('id, store_name, description, logo_url, location, verified, created_at', {
        count: 'exact',
      })
      .eq('status', 'approved')
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

    // Check if already registered
    const { data: existing } = await supabase
      .from('sellers')
      .select('id, status')
      .eq('id', user.id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Already registered as a seller', status: existing.status },
        { status: 409 }
      )
    }

    const body = await request.json()
    const { store_name, description, phone, location, logo_url } =
      RegisterSellerSchema.parse(body)

    logInfo('Registering seller', { user_id: user.id, store_name })

    // Check store_name uniqueness
    const { data: nameTaken } = await supabase
      .from('sellers')
      .select('id')
      .eq('store_name', store_name)
      .single()

    if (nameTaken) {
      return NextResponse.json(
        { error: 'Store name is already taken' },
        { status: 409 }
      )
    }

    // Insert seller row (sellers.id = auth.users.id via profiles FK)
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .insert({ id: user.id, store_name, description, phone, location, logo_url })
      .select()
      .single()

    if (sellerError) throw sellerError

    // Update profile role to 'seller'
    await supabase
      .from('profiles')
      .update({ role: 'seller', shop_name: store_name, shop_description: description })
      .eq('id', user.id)

    logInfo('Seller registered', { seller_id: seller.id, store_name })

    return NextResponse.json(seller, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
