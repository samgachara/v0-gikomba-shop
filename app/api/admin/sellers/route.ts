import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { ApproveSelllerSchema } from '@/lib/validations'
import { handleError, logInfo } from '@/lib/api-error'

// GET /api/admin/sellers — list all sellers (any status)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // pending | approved | rejected | suspended
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    logInfo('Admin fetching sellers', { status })

    let query = supabase
      .from('sellers')
      .select(
        `id, store_name, description, status, verified, phone, location, logo_url, created_at,
         profile:profiles!sellers_id_fkey(id, first_name, last_name, role)`,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) query = query.eq('status', status)

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({ data, pagination: { total: count, limit, offset } })
  } catch (error) {
    return handleError(error)
  }
}

// PATCH /api/admin/sellers — approve, reject, or suspend a seller
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { seller_id, status } = ApproveSelllerSchema.parse(body)

    logInfo('Admin updating seller status', { seller_id, status, by: user.id })

    const { data, error } = await supabase
      .from('sellers')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', seller_id)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    // If approved, ensure profile role is 'seller'
    if (status === 'approved') {
      await supabase
        .from('profiles')
        .update({ role: 'seller' })
        .eq('id', seller_id)
    }

    // If rejected/suspended, downgrade profile role back to 'buyer'
    if (status === 'rejected' || status === 'suspended') {
      await supabase
        .from('profiles')
        .update({ role: 'buyer' })
        .eq('id', seller_id)
    }

    logInfo('Seller status updated', { seller_id, status })

    return NextResponse.json(data)
  } catch (error) {
    return handleError(error)
  }
}
