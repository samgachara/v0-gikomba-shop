import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { handleError, logInfo } from '@/lib/api-error'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    logInfo('Fetching product', { id })

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('products')
      .select(
        `*,
         seller:sellers(id, store_name, verified, logo_url, location, description),
         reviews:product_reviews(id, rating, comment, created_at,
           user:profiles(id, first_name, last_name, avatar_url)
         )`
      )
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return handleError(error)
  }
}
