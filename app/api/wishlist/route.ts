import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ecrttmokkmaqdlsxhlvv.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjcnR0bW9ra21hcWRsc3hobHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTU2MzAsImV4cCI6MjA4ODc5MTYzMH0.cb8SIczUHH3a6hytKZsFCuQF1qEKT7CIbuoUScrgAE0',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      // Not logged in — return empty wishlist silently, not an error
      return NextResponse.json({ items: [] }, { status: 200 })
    }

    const { data, error } = await supabase
      .from("wishlist_items")
      .select(`
        id,
        product_id,
        created_at,
        products (
          id,
          title,
          price,
          image_url,
          images,
          is_active,
          seller_id
        )
      `)
      .eq("user_id", user.id)

    if (error) {
      console.error("[wishlist/GET] Database error:", error.message)
      return NextResponse.json({ items: [] }, { status: 200 })
    }

    return NextResponse.json({ items: data ?? [] })
  } catch (err) {
    console.error("[wishlist/GET] Unexpected error:", err)
    return NextResponse.json({ items: [] }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { product_id } = body

    if (!product_id) {
      return NextResponse.json({ error: "product_id is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("wishlist_items")
      .insert({ user_id: user.id, product_id })
      .select()
      .single()

    if (error) {
      // Unique constraint = already wishlisted, treat as success
      if (error.code === "23505") {
        return NextResponse.json({ already_exists: true })
      }
      console.error("[wishlist/POST] Insert error:", error.message)
      return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 })
    }

    return NextResponse.json({ item: data }, { status: 201 })
  } catch (err) {
    console.error("[wishlist/POST] Unexpected error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("product_id")

    if (!productId) {
      return NextResponse.json({ error: "product_id is required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId)

    if (error) {
      console.error("[wishlist/DELETE] Error:", error.message)
      return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[wishlist/DELETE] Unexpected error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
