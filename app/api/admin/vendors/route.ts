import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { ApproveVendorSchema } from '@/lib/validations'
import { handleError, logInfo } from '@/lib/api-error'

async function checkAdminAccess(userId: string, supabase: any) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  return profile?.role === 'admin'
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await checkAdminAccess(user.id, supabase)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    logInfo('Fetching vendors for admin', { status })

    let query = supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await checkAdminAccess(user.id, supabase)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { vendor_id, status, approval_reason } = ApproveVendorSchema.parse(body)

    logInfo('Updating vendor status', { vendor_id, status })

    const { data, error } = await supabase
      .from('vendors')
      .update({
        status,
        approval_reason: approval_reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', vendor_id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    return handleError(error)
  }
}
