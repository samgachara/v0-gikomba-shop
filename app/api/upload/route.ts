// app/api/upload/route.ts — Cloudinary signed upload for product images
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const CLOUD_NAME   = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const API_KEY      = process.env.CLOUDINARY_API_KEY
const API_SECRET   = process.env.CLOUDINARY_API_SECRET

function apiError(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

// POST /api/upload — accepts multipart/form-data with a 'file' field
export async function POST(request: Request) {
  // Auth check — only signed-in sellers/admins can upload
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!['seller', 'admin'].includes(profile?.role ?? ''))
    return apiError('Only sellers and admins can upload images', 403)

  if (!CLOUD_NAME || !API_KEY || !API_SECRET)
    return apiError('Image upload is not configured. Contact support.', 503)

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return apiError('No file provided')

    const maxMB = 10
    if (file.size > maxMB * 1024 * 1024)
      return apiError(`File too large. Max size is ${maxMB}MB`)

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type))
      return apiError('Invalid file type. Use JPG, PNG, WebP, or GIF')

    // Build Cloudinary upload form
    const timestamp = Math.round(Date.now() / 1000)
    const folder    = `gikomba/products/${user.id}`
    const params    = `folder=${folder}&timestamp=${timestamp}`

    // Generate SHA-1 signature
    const crypto  = await import('crypto')
    const signature = crypto
      .createHash('sha1')
      .update(`${params}${API_SECRET}`)
      .digest('hex')

    const body = new FormData()
    body.append('file',       file)
    body.append('api_key',    API_KEY)
    body.append('timestamp',  String(timestamp))
    body.append('folder',     folder)
    body.append('signature',  signature)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body }
    )

    if (!res.ok) {
      const err = await res.json()
      console.error('[upload] Cloudinary error:', err)
      return apiError(err.error?.message ?? 'Upload failed', 500)
    }

    const data = await res.json()
    return NextResponse.json({
      url:       data.secure_url,
      public_id: data.public_id,
      width:     data.width,
      height:    data.height,
    })
  } catch (err) {
    console.error('[upload] Error:', err)
    return apiError('Upload failed. Please try again.', 500)
  }
}
