import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { UpdateVendorSchema } from '@/lib/validations'
import { handleError, logInfo } from '@/lib/api-error'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = await createClient()

    logInfo('Fetching vendor', { vendor_id: id })

    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify vendor ownership
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('user_id')
      .eq('id', id)
      .single()

    if (vendorError || !vendor || vendor.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - cannot update this vendor' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const updateData = UpdateVendorSchema.parse(body)

    logInfo('Updating vendor', { vendor_id: id, user_id: user.id })

    const { data: updated, error } = await supabase
      .from('vendors')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(updated)
  } catch (error) {
    return handleError(error)
  }
}
