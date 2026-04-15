import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { UpdateSellerProductSchema } from '@/lib/validations'
import { handleError, logInfo } from '@/lib/api-error'

// PATCH /api/seller/products/[id] — update own product
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify ownership
    const { data: existing } = await supabase
      .from('products')
      .select('id, seller_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    if (existing.seller_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const updates = UpdateSellerProductSchema.parse(body)

    logInfo('Updating product', { seller_id: user.id, product_id: id })

    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('seller_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return handleError(error)
  }
}

// DELETE /api/seller/products/[id] — soft-delete (set is_active = false)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: existing } = await supabase
      .from('products')
      .select('id, seller_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    if (existing.seller_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    logInfo('Deactivating product', { seller_id: user.id, product_id: id })

    // Soft delete — preserves order history
    await supabase
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('seller_id', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
}
