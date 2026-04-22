import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

async function requireAdmin(supabase: any, user: any) {
  const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return p?.role === 'admin'
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requireAdmin(supabase, user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const role   = searchParams.get('role')
  const search = searchParams.get('search')
  const limit  = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  let query = supabase
    .from('profiles')
    .select('id, first_name, last_name, phone, role, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (role) query = query.eq('role', role)
  if (search) query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users: data ?? [], total: count ?? 0 })
}

const UpdateRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(['buyer', 'seller', 'admin']),
})

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requireAdmin(supabase, user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { user_id, role } = UpdateRoleSchema.parse(body)

  // Prevent admin from demoting themselves
  if (user_id === user.id && role !== 'admin')
    return NextResponse.json({ error: 'Cannot change your own admin role' }, { status: 400 })

  const { error } = await supabase
    .from('profiles').update({ role }).eq('id', user_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // If promoting to seller, ensure sellers row exists
  if (role === 'seller') {
    const { data: profile } = await supabase.from('profiles').select('first_name').eq('id', user_id).single()
    await supabase.from('sellers').upsert({
      id: user_id,
      store_name: `${profile?.first_name ?? 'New'}'s Shop`,
      status: 'active', verified: false,
    }, { onConflict: 'id' })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requireAdmin(supabase, user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { user_id } = await request.json()
  if (user_id === user.id) return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })

  // Delete from auth.users cascades to profiles via FK
  const { error } = await supabase.auth.admin.deleteUser(user_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
