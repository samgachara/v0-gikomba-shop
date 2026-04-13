import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { GetProductsSchema } from '@/lib/validations'
import { handleError, logInfo } from '@/lib/api-error'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit') || '20'
    const offset = searchParams.get('offset') || '0'
    const page = searchParams.get('page')

    logInfo('Fetching products', { category, featured, search, limit, offset, page })

    const supabase = await createClient()

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Handle pagination
    const parsedLimit = Math.min(parseInt(limit) || 20, 100) // Max 100 per request
    const parsedOffset = page
      ? (parseInt(page) - 1) * parsedLimit
      : parseInt(offset) || 0

    query = query.range(parsedOffset, parsedOffset + parsedLimit - 1)

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      data,
      pagination: {
        total: count,
        limit: parsedLimit,
        offset: parsedOffset,
        page: page ? parseInt(page) : Math.floor(parsedOffset / parsedLimit) + 1,
      },
    })
  } catch (error) {
    return handleError(error)
  }
}
