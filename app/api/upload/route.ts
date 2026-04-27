// app/api/upload/route.ts
// Uploads to Cloudinary if configured, falls back to Supabase Storage
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const API_KEY    = process.env.CLOUDINARY_API_KEY
const API_SECRET = process.env.CLOUDINARY_API_SECRET

function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return err('Please sign in to upload images', 401)

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!['seller', 'admin'].includes(profile?.role ?? ''))
    return err('Only sellers and admins can upload images', 403)

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return err('Invalid request — expected multipart/form-data')
  }

  const file = formData.get('file') as File | null
  if (!file) return err('No file provided')
  if (file.size > 10 * 1024 * 1024) return err('File too large. Maximum size is 10MB')

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
  if (!allowed.includes(file.type))
    return err('Invalid file type. Please use JPG, PNG, WebP, or GIF')

  // ── Path A: Cloudinary ────────────────────────────────────────────────────
  if (CLOUD_NAME && API_KEY && API_SECRET) {
    try {
      const bytes     = await file.arrayBuffer()
      const buffer    = Buffer.from(bytes)
      const timestamp = Math.round(Date.now() / 1000)
      const folder    = `gikomba/products/${user.id}`
      const { createHash } = await import('crypto')
      const signature = createHash('sha1')
        .update(`folder=${folder}&timestamp=${timestamp}${API_SECRET}`)
        .digest('hex')

      const body = new FormData()
      body.append('file',      new Blob([buffer], { type: file.type }), file.name)
      body.append('api_key',   API_KEY)
      body.append('timestamp', String(timestamp))
      body.append('folder',    folder)
      body.append('signature', signature)

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body }
      )
      const data = await res.json()

      if (!res.ok) {
        console.error('[upload] Cloudinary error:', JSON.stringify(data))
        // Fall through to Supabase if Cloudinary fails
      } else {
        return NextResponse.json({
          url:      data.secure_url,
          public_id: data.public_id,
        })
      }
    } catch (e) {
      console.error('[upload] Cloudinary exception:', e)
      // Fall through to Supabase Storage
    }
  }

  // ── Path B: Supabase Storage fallback ─────────────────────────────────────
  try {
    const bytes    = await file.arrayBuffer()
    const ext      = file.name.split('.').pop() ?? 'jpg'
    const filename = `${user.id}/${Date.now()}.${ext}`

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('product-images')
      .upload(filename, bytes, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[upload] Supabase Storage error:', uploadError.message)
      return err(`Upload failed: ${uploadError.message}`, 500)
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('product-images')
      .getPublicUrl(uploadData.path)

    return NextResponse.json({ url: publicUrl })
  } catch (e: any) {
    console.error('[upload] Storage exception:', e)
    return err('Upload failed. Please try pasting an image URL instead.', 500)
  }
}
