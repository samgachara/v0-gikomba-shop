import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { CreateVendorSchema } from '@/lib/validations'
import { handleError, logInfo } from '@/lib/api-error'

export async function GET() {
  try {
    const supabase = await createClient()

    logInfo('Fetching approved vendors', {})

    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('status', 'approved')
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

    const body = await request.json()
    const vendorData = CreateVendorSchema.parse(body)

    logInfo('Creating vendor account', { user_id: user.id })

    // Check if user already has a vendor account
    const { data: existingVendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingVendor) {
      return NextResponse.json(
        { error: 'User already has a vendor account' },
        { status: 409 }
      )
    }

    // Create vendor account
    const { data: vendor, error } = await supabase
      .from('vendors')
      .insert({
        user_id: user.id,
        ...vendorData,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Update user profile with role and vendor_id
    await supabase
      .from('profiles')
      .update({ role: 'seller', vendor_id: vendor.id })
      .eq('id', user.id)

    logInfo('Vendor account created', { vendor_id: vendor.id })

    return NextResponse.json(vendor, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
