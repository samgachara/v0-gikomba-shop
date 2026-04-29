import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Helper to build an authenticated Supabase server client from cookies
async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    // Verify the user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ items: [] }, { status: 200 })
    }

    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        id,
        quantity,
        product_id,
        products (
          id,
          title,
          price,
          image_url,
          images,
          stock,
          is_active,
          seller_id
        )
      `)
      .eq("user_id", user.id)

    if (error) {
      console.error("[cart/GET] Database error:", error.message)
      return NextResponse.json(
        { error: "Failed to fetch cart" },
        { status: 500 }
      )
    }

    return NextResponse.json({ items: data ?? [] })
  } catch (err) {
    console.error("[cart/GET] Unexpected error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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
    const { product_id, quantity = 1 } = body

    if (!product_id) {
      return NextResponse.json({ error: "product_id is required" }, { status: 400 })
    }

    // Upsert: if item already in cart, increment quantity
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", product_id)
      .single()

    if (existing) {
      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single()

      if (error) {
        console.error("[cart/POST] Update error:", error.message)
        return NextResponse.json({ error: "Failed to update cart" }, { status: 500 })
      }
      return NextResponse.json({ item: data })
    }

    const { data, error } = await supabase
      .from("cart_items")
      .insert({ user_id: user.id, product_id, quantity })
      .select()
      .single()

    if (error) {
      console.error("[cart/POST] Insert error:", error.message)
      return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 })
    }

    return NextResponse.json({ item: data }, { status: 201 })
  } catch (err) {
    console.error("[cart/POST] Unexpected error:", err)
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
    const itemId = searchParams.get("id")

    if (!itemId) {
      return NextResponse.json({ error: "Item id is required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId)
      .eq("user_id", user.id) // safety: only delete own items

    if (error) {
      console.error("[cart/DELETE] Error:", error.message)
      return NextResponse.json({ error: "Failed to remove item" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[cart/DELETE] Unexpected error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
