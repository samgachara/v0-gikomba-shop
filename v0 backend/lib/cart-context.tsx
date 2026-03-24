'use client'

import { createContext, useContext, useCallback } from 'react'
import useSWR from 'swr'
import { toast } from 'sonner'
import type { CartItem, WishlistItem } from './types'

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

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (res.status === 401) return []
  if (!res.ok) throw new Error('Failed to fetch')
  const payload = await res.json()
  if (!payload.success) throw new Error(payload.error || 'Failed request')
  return payload.data
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const swrConfig = {
    revalidateOnFocus: false,
    dedupingInterval: 3000,
  }
  const { data: cart = [], isLoading: cartLoading, mutate: mutateCart } = useSWR<CartItem[]>('/api/cart', fetcher, swrConfig)
  const { data: wishlist = [], isLoading: wishlistLoading, mutate: mutateWishlist } = useSWR<WishlistItem[]>('/api/wishlist', fetcher, swrConfig)

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const wishlistCount = wishlist.length
  const cartTotal = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity }),
    })
    const payload = await res.json()
    if (!res.ok || !payload.success) throw new Error(payload.error || 'Unable to add to cart')
    toast.success('Added to cart')
    mutateCart()
  }, [mutateCart])

  const updateCartItem = useCallback(async (id: string, quantity: number) => {
    const res = await fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, quantity }),
    })
    const payload = await res.json()
    if (!res.ok || !payload.success) throw new Error(payload.error || 'Unable to update cart')
    mutateCart()
  }, [mutateCart])

  const removeFromCart = useCallback(async (id: string) => {
    const res = await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const payload = await res.json()
    if (!res.ok || !payload.success) throw new Error(payload.error || 'Unable to remove item')
    toast.success('Item removed from cart')
    mutateCart()
  }, [mutateCart])

  const addToWishlist = useCallback(async (productId: string) => {
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    })
    const payload = await res.json()
    if (!res.ok || !payload.success) throw new Error(payload.error || 'Unable to add wishlist')
    toast.success('Added to wishlist')
    mutateWishlist()
  }, [mutateWishlist])

  const removeFromWishlist = useCallback(async (productId: string) => {
    const res = await fetch('/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    })
    const payload = await res.json()
    if (!res.ok || !payload.success) throw new Error(payload.error || 'Unable to remove wishlist')
    toast.success('Removed from wishlist')
    mutateWishlist()
  }, [mutateWishlist])

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some(item => item.product_id === productId)
  }, [wishlist])

  return (
    <CartContext.Provider value={{
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
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
