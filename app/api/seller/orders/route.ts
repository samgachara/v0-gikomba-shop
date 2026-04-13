import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleError, logInfo } from '@/lib/api-error'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get vendor for user
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: 'Vendor account not found' },
        { status: 404 }
      )
    }

    logInfo('Fetching seller orders', { vendor_id: vendor.id })

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(*)
        )
      `)
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    return handleError(error)
  }
}
