import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { UpdateSellerSchema } from '@/lib/validations'
import { handleError, logInfo } from '@/lib/api-error'

// GET /api/sellers/[id] — public seller profile + their products
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('sellers')
      .select(`
        id, store_name, description, logo_url, location, verified, created_at,
        products(id, title, name, price, original_price, image_url, category,
                 rating, review_count, condition, is_active)
      `)
      .eq('id', id)
      .eq('status', 'approved')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return handleError(error)
  }
}

// PATCH /api/sellers/[id] — seller updates their own profile
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.id !== id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const updates = UpdateSellerSchema.parse(body)

    logInfo('Updating seller', { seller_id: id })

    const { data, error } = await supabase
      .from('sellers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return handleError(error)
  }
}
