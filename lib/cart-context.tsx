'use client'

import { createContext, useContext, useCallback, useEffect, useState, useRef } from 'react'
import useSWR from 'swr'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { CartItem, WishlistItem, Product } from './types'

// ---------------------------------------------------------------------------
// Guest cart item stored in localStorage (no DB ids yet)
// ---------------------------------------------------------------------------
interface GuestCartItem {
  guest_id: string        // random local id
  product_id: string
  quantity: number
  product?: Product
}

const GUEST_CART_KEY = 'gikomba_guest_cart'

function loadGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveGuestCart(items: GuestCartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

function clearGuestCart() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(GUEST_CART_KEY)
}

// ---------------------------------------------------------------------------
// Context types — unchanged public interface
// ---------------------------------------------------------------------------
interface CartContextType {
  cart: CartItem[]
  wishlist: WishlistItem[]
  cartLoading: boolean
  wishlistLoading: boolean
  cartCount: number
  wishlistCount: number
  cartTotal: number
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateCartItem: (id: string, quantity: number) => Promise<void>
  removeFromCart: (id: string) => Promise<void>
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  refreshCart: () => void
  refreshWishlist: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Fetcher for authenticated requests
const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (res.status === 401) return []
  if (!res.ok) throw new Error('Failed to fetch')
  const json = await res.json()
  return Array.isArray(json) ? json : (json.data ?? [])
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [authReady, setAuthReady] = useState(false)

  // Guest cart state (localStorage-backed)
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([])
  const mergeInProgress = useRef(false)

  // Authenticated server cart
  const {
    data: serverCart = [],
    isLoading: serverCartLoading,
    mutate: mutateCart,
  } = useSWR<CartItem[]>(user ? '/api/cart' : null, fetcher, { shouldRetryOnError: false })

  const {
    data: wishlist = [],
    isLoading: wishlistLoading,
    mutate: mutateWishlist,
  } = useSWR<WishlistItem[]>(user ? '/api/wishlist' : null, fetcher, { shouldRetryOnError: false, revalidateOnFocus: false })

  // ── Auth listener ──────────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── Load guest cart from localStorage on mount ─────────────────────────
  useEffect(() => {
    setGuestCart(loadGuestCart())
  }, [])

  // ── Merge guest cart → server when user logs in ────────────────────────
  useEffect(() => {
    if (!user || !authReady || mergeInProgress.current) return
    const pending = loadGuestCart()
    if (pending.length === 0) return

    mergeInProgress.current = true
    ;(async () => {
      for (const item of pending) {
        try {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: item.product_id, quantity: item.quantity }),
          })
        } catch {
          // ignore individual merge failures
        }
      }
      clearGuestCart()
      setGuestCart([])
      mutateCart()
      mergeInProgress.current = false
    })()
  }, [user, authReady, mutateCart])

  // ── Hydrate guest cart product details ────────────────────────────────
  // When a guest adds an item we fetch the product so the cart page can display it
  const hydrateGuestProduct = useCallback(async (productId: string): Promise<Product | undefined> => {
    try {
      const res = await fetch(`/api/products/${productId}`)
      if (!res.ok) return undefined
      const json = await res.json()
      return json.data ?? json
    } catch {
      return undefined
    }
  }, [])

  // ── Derived values ─────────────────────────────────────────────────────
  // For guests we use guestCart; for authenticated users we use serverCart
  const activeCart = user ? serverCart : []
  const cartLoading = user ? serverCartLoading : !authReady

  // Build a unified CartItem[] from guestCart so the cart page works identically
  const guestCartAsCartItems: CartItem[] = guestCart.map(g => ({
    id: g.guest_id,
    user_id: '',
    product_id: g.product_id,
    quantity: g.quantity,
    created_at: '',
    updated_at: '',
    product: g.product,
  }))

  const cart: CartItem[] = user ? activeCart : guestCartAsCartItems

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
  const wishlistCount = wishlist.length

  // ── addToCart ──────────────────────────────────────────────────────────
  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      if (!user) {
        // Guest path — store in localStorage
        const product = await hydrateGuestProduct(productId)
        setGuestCart(prev => {
          const existing = prev.find(i => i.product_id === productId)
          let next: GuestCartItem[]
          if (existing) {
            next = prev.map(i =>
              i.product_id === productId
                ? { ...i, quantity: i.quantity + quantity }
                : i
            )
          } else {
            next = [...prev, {
              guest_id: `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`,
              product_id: productId,
              quantity,
              product,
            }]
          }
          saveGuestCart(next)
          return next
        })
        toast.success('Added to cart')
        return
      }

      // Authenticated path — server
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Failed to add item to cart'); return }
      toast.success('Added to cart')
      mutateCart()
    },
    [user, mutateCart, hydrateGuestProduct],
  )

  // ── updateCartItem ─────────────────────────────────────────────────────
  const updateCartItem = useCallback(
    async (id: string, quantity: number) => {
      if (!user) {
        setGuestCart(prev => {
          const next = prev.map(i => i.guest_id === id ? { ...i, quantity } : i)
          saveGuestCart(next)
          return next
        })
        return
      }
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, quantity }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Failed to update cart'); return }
      mutateCart()
    },
    [user, mutateCart],
  )

  // ── removeFromCart ─────────────────────────────────────────────────────
  const removeFromCart = useCallback(
    async (id: string) => {
      if (!user) {
        setGuestCart(prev => {
          const next = prev.filter(i => i.guest_id !== id)
          saveGuestCart(next)
          return next
        })
        toast.success('Item removed from cart')
        return
      }
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Failed to remove item'); return }
      toast.success('Item removed from cart')
      mutateCart()
    },
    [user, mutateCart],
  )

  // ── Wishlist (auth-only, unchanged) ────────────────────────────────────
  const addToWishlist = useCallback(
    async (productId: string) => {
      // Show friendly toast instead of hard redirect when not logged in
      if (!user) {
        toast.error('Sign in to save items to your wishlist', {
          action: { label: 'Sign In', onClick: () => { if (typeof window !== 'undefined') window.location.href = '/auth/login' } },
          duration: 4000,
        })
        return
      }
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Failed to add to wishlist'); return }
      toast.success('Added to wishlist ❤️')
      mutateWishlist()
    },
    [user, mutateWishlist],
  )

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      const res = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Failed to remove from wishlist'); return }
      toast.success('Removed from wishlist')
      mutateWishlist()
    },
    [mutateWishlist],
  )

  const isInWishlist = useCallback(
    (productId: string) => wishlist.some(item => item.product_id === productId),
    [wishlist],
  )

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        cartLoading,
        wishlistLoading,
        cartCount,
        wishlistCount,
        cartTotal,
        addToCart,
        updateCartItem,
        removeFromCart,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        refreshCart: mutateCart,
        refreshWishlist: mutateWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
