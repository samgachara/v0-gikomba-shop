import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handleError } from '@/lib/api-error'

const UpdateOrderSchema = z.object({
  status:          z.enum(['confirmed', 'shipped', 'delivered', 'cancelled']),
  tracking_number: z.string().max(100).optional(),
  notes:           z.string().max(500).optional(),
})

// PATCH /api/seller/orders/[id] — seller updates order status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: orderId } = await params
    const body = await request.json()
    const { status, tracking_number, notes } = UpdateOrderSchema.parse(body)

    // Verify this seller owns a product in this order
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('product_id, products!inner(seller_id)')
      .eq('order_id', orderId)

    const sellerOwnsOrder = (orderItems ?? []).some(
      (item: any) => item.products?.seller_id === user.id
    )

    if (!sellerOwnsOrder) {
      return NextResponse.json({ error: 'Order not found or not yours' }, { status: 404 })
    }

    // Enforce valid status transitions — sellers can't skip steps
    const { data: order } = await supabase
      .from('orders')
      .select('status, payment_status')
      .eq('id', orderId)
      .single()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    // Only allow fulfillment after payment is confirmed
    if (order.payment_status !== 'completed' && status !== 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot fulfil order before payment is confirmed' },
        { status: 400 }
      )
    }

    const validTransitions: Record<string, string[]> = {
      pending:   ['confirmed', 'cancelled'],
      confirmed: ['shipped',   'cancelled'],
      shipped:   ['delivered'],
      delivered: [],
      cancelled: [],
    }

    if (!validTransitions[order.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Cannot move order from '${order.status}' to '${status}'` },
        { status: 400 }
      )
    }

    const update: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }
    if (tracking_number) update.tracking_number = tracking_number
    if (notes)           update.notes = notes

    const { data, error } = await supabase
      .from('orders')
      .update(update)
      .eq('id', orderId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    return handleError(error)
  }
}
