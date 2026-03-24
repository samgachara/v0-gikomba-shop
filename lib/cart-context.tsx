'use client'

import { createContext, useContext, useCallback, useMemo } from 'react'
import useSWR from 'swr'
import { toast } from 'sonner'
import type { CartItem, WishlistItem } from './types'
import type { ApiResponse } from './api-utils'

interface CartContextType {
  cart: CartItem[]
  wishlist: WishlistItem[]
  cartLoading: boolean
  wishlistLoading: boolean
  cartCount: number
  wishlistCount: number
  cartTotal: number
  addToCart: (productId: string, quantity?: number) => Promise<boolean>
  updateCartItem: (id: string, quantity: number) => Promise<boolean>
  removeFromCart: (id: string) => Promise<boolean>
  addToWishlist: (productId: string) => Promise<boolean>
  removeFromWishlist: (productId: string) => Promise<boolean>
  isInWishlist: (productId: string) => boolean
  refreshCart: () => void
  refreshWishlist: () => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const fetcher = async (url: string): Promise<CartItem[] | WishlistItem[]> => {
  const res = await fetch(url)
  if (res.status === 401) return []
  if (!res.ok) throw new Error('Failed to fetch')
  const json: ApiResponse<CartItem[] | WishlistItem[]> = await res.json()
  // Handle both old and new response formats
  if ('success' in json && json.data !== undefined) {
    return json.data as CartItem[] | WishlistItem[]
  }
  return json as unknown as CartItem[] | WishlistItem[]
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { 
    data: cart = [], 
    isLoading: cartLoading, 
    mutate: mutateCart 
  } = useSWR<CartItem[]>('/api/cart', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  })
  
  const { 
    data: wishlist = [], 
    isLoading: wishlistLoading, 
    mutate: mutateWishlist 
  } = useSWR<WishlistItem[]>('/api/wishlist', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  })

  const cartCount = useMemo(() => 
    cart.reduce((sum, item) => sum + item.quantity, 0), 
    [cart]
  )
  
  const wishlistCount = wishlist.length
  
  const cartTotal = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0),
    [cart]
  )

  const addToCart = useCallback(async (productId: string, quantity = 1): Promise<boolean> => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity }),
      })

      const json: ApiResponse = await res.json()

      if (!res.ok || !json.success) {
        toast.error('Failed to add to cart', {
          description: json.error || 'Please try again',
        })
        return false
      }

      await mutateCart()
      toast.success('Added to cart', {
        description: 'Item has been added to your cart',
      })
      return true
    } catch {
      toast.error('Failed to add to cart', {
        description: 'Please check your connection and try again',
      })
      return false
    }
  }, [mutateCart])

  const updateCartItem = useCallback(async (id: string, quantity: number): Promise<boolean> => {
    // Optimistic update
    const previousCart = cart
    const optimisticCart = cart.map(item => 
      item.id === id ? { ...item, quantity } : item
    )
    mutateCart(optimisticCart, false)

    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, quantity }),
      })

      const json: ApiResponse = await res.json()

      if (!res.ok || !json.success) {
        // Rollback on error
        mutateCart(previousCart, false)
        toast.error('Failed to update cart', {
          description: json.error || 'Please try again',
        })
        return false
      }

      await mutateCart()
      return true
    } catch {
      // Rollback on error
      mutateCart(previousCart, false)
      toast.error('Failed to update cart', {
        description: 'Please check your connection and try again',
      })
      return false
    }
  }, [cart, mutateCart])

  const removeFromCart = useCallback(async (id: string): Promise<boolean> => {
    // Optimistic update
    const previousCart = cart
    const optimisticCart = cart.filter(item => item.id !== id)
    mutateCart(optimisticCart, false)

    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      const json: ApiResponse = await res.json()

      if (!res.ok || !json.success) {
        // Rollback on error
        mutateCart(previousCart, false)
        toast.error('Failed to remove item', {
          description: json.error || 'Please try again',
        })
        return false
      }

      toast.success('Item removed', {
        description: 'Item has been removed from your cart',
      })
      return true
    } catch {
      // Rollback on error
      mutateCart(previousCart, false)
      toast.error('Failed to remove item', {
        description: 'Please check your connection and try again',
      })
      return false
    }
  }, [cart, mutateCart])

  const addToWishlist = useCallback(async (productId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      })

      const json: ApiResponse = await res.json()

      if (!res.ok || !json.success) {
        toast.error('Failed to add to wishlist', {
          description: json.error || 'Please try again',
        })
        return false
      }

      await mutateWishlist()
      toast.success('Added to wishlist', {
        description: 'Item has been saved to your wishlist',
      })
      return true
    } catch {
      toast.error('Failed to add to wishlist', {
        description: 'Please check your connection and try again',
      })
      return false
    }
  }, [mutateWishlist])

  const removeFromWishlist = useCallback(async (productId: string): Promise<boolean> => {
    // Optimistic update
    const previousWishlist = wishlist
    const optimisticWishlist = wishlist.filter(item => item.product_id !== productId)
    mutateWishlist(optimisticWishlist, false)

    try {
      const res = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      })

      const json: ApiResponse = await res.json()

      if (!res.ok || !json.success) {
        // Rollback on error
        mutateWishlist(previousWishlist, false)
        toast.error('Failed to remove from wishlist', {
          description: json.error || 'Please try again',
        })
        return false
      }

      toast.success('Removed from wishlist')
      return true
    } catch {
      // Rollback on error
      mutateWishlist(previousWishlist, false)
      toast.error('Failed to remove from wishlist', {
        description: 'Please check your connection and try again',
      })
      return false
    }
  }, [wishlist, mutateWishlist])

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some(item => item.product_id === productId)
  }, [wishlist])

  const clearCart = useCallback(() => {
    mutateCart([], false)
  }, [mutateCart])

  const value = useMemo(() => ({
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
    clearCart,
  }), [
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
    mutateCart,
    mutateWishlist,
    clearCart,
  ])

  return (
    <CartContext.Provider value={value}>
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
