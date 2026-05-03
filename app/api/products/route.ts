import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")
    const search = searchParams.get("search")
    const limit = parseInt(searchParams.get("limit") ?? "50")
    const page = parseInt(searchParams.get("page") ?? "1")
    const offset = (page - 1) * limit

    const cookieStore = await cookies()
    const supabase = createServerClient(
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

    // Always query from `products` table (NOT seller_products)
    // The anon RLS policy allows reading all is_active = true rows
    let query = supabase
      .from("products")
      .select(
        `
        id,
        title,
        name,
        description,
        price,
        original_price,
        image_url,
        images,
        category,
        condition,
        stock,
        is_active,
        is_featured,
        is_new,
        rating,
        review_count,
        num_reviews,
        quality_grade,
        seller_id,
        created_at,
        updated_at,
        sellers (
          id,
          store_name,
          verified,
          location,
          logo_url
        )
      `,
        { count: "exact" }
      )
      .eq("is_active", true)   // ALWAYS filter by active — never show inactive
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Optional filters — only apply if explicitly requested
    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    // Only filter by featured if ?featured=true is explicitly passed
    // Never default to featured-only — show all active products by default
    if (featured === "true") {
      query = query.eq("is_featured", true)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      console.error("[products/GET] Database error:", error.message)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    return NextResponse.json({
      products: data ?? [],
      total: count ?? 0,
      page,
      limit,
      pages: Math.ceil((count ?? 0) / limit),
    })
  } catch (err) {
    console.error("[products/GET] Unexpected error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
