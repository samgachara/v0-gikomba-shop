'use client'

import { createContext, useContext, useCallback } from 'react'
import useSWR from 'swr'
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
  return res.json()
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: cart = [], isLoading: cartLoading, mutate: mutateCart } = useSWR<CartItem[]>('/api/cart', fetcher)
  const { data: wishlist = [], isLoading: wishlistLoading, mutate: mutateWishlist } = useSWR<WishlistItem[]>('/api/wishlist', fetcher)

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const wishlistCount = wishlist.length
  const cartTotal = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity }),
    })
    mutateCart()
  }, [mutateCart])

  const updateCartItem = useCallback(async (id: string, quantity: number) => {
    await fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, quantity }),
    })
    mutateCart()
  }, [mutateCart])

  const removeFromCart = useCallback(async (id: string) => {
    await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    mutateCart()
  }, [mutateCart])

  const addToWishlist = useCallback(async (productId: string) => {
    await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    })
    mutateWishlist()
  }, [mutateWishlist])

  const removeFromWishlist = useCallback(async (productId: string) => {
    await fetch('/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    })
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
