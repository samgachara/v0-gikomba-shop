import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { CreateSellerProductSchema } from '@/lib/validations'
import { handleError, logInfo } from '@/lib/api-error'

// GET /api/seller/products — seller's own product listings
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    logInfo('Seller fetching products', { seller_id: user.id })

    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({ data, pagination: { total: count, limit, offset } })
  } catch (error) {
    return handleError(error)
  }
}

// POST /api/seller/products — create a new product listing
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Confirm user is an approved seller
    const { data: seller } = await supabase
      .from('sellers')
      .select('id, status')
      .eq('id', user.id)
      .single()

    if (!seller) {
      return NextResponse.json({ error: 'Seller account not found' }, { status: 403 })
    }
    if (seller.status !== 'approved') {
      return NextResponse.json(
        { error: 'Seller account is pending approval' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const productData = CreateSellerProductSchema.parse(body)

    logInfo('Creating product', { seller_id: user.id, title: productData.title })

    const { data, error } = await supabase
      .from('products')
      .insert({ ...productData, seller_id: user.id, is_active: true })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
