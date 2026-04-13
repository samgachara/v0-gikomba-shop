import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { CreateProductSchema, UpdateSellerProductSchema } from '@/lib/validations'
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

    logInfo('Fetching seller products', { vendor_id: vendor.id })

    const { data, error } = await supabase
      .from('products')
      .select('*')
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

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get vendor for user
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id, status')
      .eq('user_id', user.id)
      .single()

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: 'Vendor account not found' },
        { status: 404 }
      )
    }

    if (vendor.status !== 'approved') {
      return NextResponse.json(
        { error: 'Vendor account must be approved before adding products' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const productData = CreateProductSchema.parse(body)

    logInfo('Creating seller product', { vendor_id: vendor.id })

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        vendor_id: vendor.id,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
