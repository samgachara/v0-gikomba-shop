import { z } from 'zod'
import { getAuthUser, ok, fail } from '@/lib/api-handler'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await getAuthUser()
  const { id } = await params

  if (!z.string().uuid().safeParse(id).success) return fail('Invalid product ID', 400)

  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
  if (error || !data) return fail('Product not found', 404)
  return ok(data)
}
