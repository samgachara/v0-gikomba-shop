import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleError, logInfo } from '@/lib/api-error'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    logInfo('Fetching current user vendor', { user_id: user.id })

    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return handleError(error)
  }
}
