import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleError, logInfo } from '@/lib/api-error'

/**
 * Process payment for an order
 * - Mark order as paid
 * - Create seller earnings record (90% to seller, 10% platform fee)
 * - Update vendor stats
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { order_id } = await request.json()

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    logInfo('Processing payment', { order_id, user_id: user.id })

    // Get order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(vendor_id)
        )
      `)
      .eq('id', order_id)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.payment_status === 'completed') {
      return NextResponse.json(
        { error: 'Order already paid' },
        { status: 409 }
      )
    }

    // Get unique vendors from order items
    const vendorIds = Array.from(new Set(
      order.items.map((item: any) => item.product?.vendor_id).filter(Boolean)
    ))

    // Update order payment status
    await supabase
      .from('orders')
      .update({
        payment_status: 'completed',
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id)

    // Create seller earnings for each vendor
    const platformFee = order.total * 0.1 // 10% platform fee
    const earningsPerVendor = (order.total - platformFee) / vendorIds.length

    for (const vendorId of vendorIds) {
      const vendorItems = order.items.filter(
        (item: any) => item.product?.vendor_id === vendorId
      )
      const vendorItemsTotal = vendorItems.reduce(
        (sum: number, item: any) => sum + (item.price * item.quantity),
        0
      )
      const vendorFee = vendorItemsTotal * 0.1
      const vendorEarnings = vendorItemsTotal - vendorFee

      await supabase
        .from('seller_earnings')
        .insert({
          vendor_id: vendorId,
          order_id: order_id,
          amount: vendorItemsTotal,
          platform_fee: vendorFee,
          net_earnings: vendorEarnings,
          status: 'verified',
        })

      // Update vendor stats
      const { data: vendor } = await supabase
        .from('vendors')
        .select('total_earnings, total_orders')
        .eq('id', vendorId)
        .single()

      if (vendor) {
        await supabase
          .from('vendors')
          .update({
            total_earnings: (vendor.total_earnings || 0) + vendorEarnings,
            total_orders: (vendor.total_orders || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', vendorId)
      }
    }

    logInfo('Payment processed successfully', { order_id })

    return NextResponse.json({ success: true, order_id })
  } catch (error) {
    return handleError(error)
  }
}
