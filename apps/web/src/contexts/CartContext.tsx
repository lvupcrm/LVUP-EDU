'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase'

// Cart item types
export interface CartItem {
  id: string
  user_id: string
  course_id: string
  added_at: string
  course: {
    id: string
    title: string
    price: number
    thumbnail?: string
    instructor: {
      user: {
        name: string
      }
    }
  }
}

export interface CartSummary {
  item_count: number
  total_amount: number
}

// Context types
interface CartContextType {
  cartItems: CartItem[]
  cartSummary: CartSummary
  isLoading: boolean
  error: string | null
  
  // Actions
  addToCart: (courseId: string) => Promise<boolean>
  removeFromCart: (courseId: string) => Promise<boolean>
  clearCart: () => Promise<boolean>
  refreshCart: () => Promise<void>
  isInCart: (courseId: string) => boolean
  validateCart: () => Promise<{ isValid: boolean; invalidItems: any[]; message: string }>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: React.ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartSummary, setCartSummary] = useState<CartSummary>({ item_count: 0, total_amount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const supabase = getSupabaseClient()

  // Initialize user and cart
  useEffect(() => {
    if (!supabase) return

    const initializeCart = async () => {
      try {
        // Get current user
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !currentUser) {
          setUser(null)
          setIsLoading(false)
          return
        }

        setUser(currentUser)
        await refreshCart()
      } catch (err) {
        console.error('Error initializing cart:', err)
        setError('장바구니를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    initializeCart()
  }, [supabase])

  // Refresh cart data
  const refreshCart = useCallback(async () => {
    if (!supabase || !user) {
      setCartItems([])
      setCartSummary({ item_count: 0, total_amount: 0 })
      return
    }

    try {
      setError(null)
      
      // Fetch cart items with course details
      const { data: items, error: itemsError } = await supabase
        .from('cart_items')
        .select(`
          *,
          course:courses(
            id,
            title,
            price,
            thumbnail,
            instructor:instructors(
              user:users(name)
            )
          )
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false })

      if (itemsError) throw itemsError

      setCartItems(items || [])
      
      // Calculate summary
      const itemCount = items?.length || 0
      const totalAmount = items?.reduce((sum, item) => sum + (item.course?.price || 0), 0) || 0
      
      setCartSummary({
        item_count: itemCount,
        total_amount: totalAmount
      })

    } catch (err) {
      console.error('Error refreshing cart:', err)
      setError('장바구니를 불러오는 중 오류가 발생했습니다.')
    }
  }, [supabase, user])

  // Add item to cart
  const addToCart = useCallback(async (courseId: string): Promise<boolean> => {
    if (!supabase || !user) {
      setError('로그인이 필요합니다.')
      return false
    }

    try {
      setError(null)
      
      const { data, error } = await supabase.rpc('add_to_cart', {
        target_course_id: courseId
      })

      if (error) {
        if (error.message.includes('Already enrolled')) {
          setError('이미 수강 중인 강의입니다.')
        } else {
          setError('장바구니에 추가하는 중 오류가 발생했습니다.')
        }
        return false
      }

      // Refresh cart data
      await refreshCart()
      return true

    } catch (err) {
      console.error('Error adding to cart:', err)
      setError('장바구니에 추가하는 중 오류가 발생했습니다.')
      return false
    }
  }, [supabase, user, refreshCart])

  // Remove item from cart
  const removeFromCart = useCallback(async (courseId: string): Promise<boolean> => {
    if (!supabase || !user) {
      setError('로그인이 필요합니다.')
      return false
    }

    try {
      setError(null)
      
      const { data, error } = await supabase.rpc('remove_from_cart', {
        target_course_id: courseId
      })

      if (error) {
        setError('장바구니에서 제거하는 중 오류가 발생했습니다.')
        return false
      }

      // Refresh cart data
      await refreshCart()
      return true

    } catch (err) {
      console.error('Error removing from cart:', err)
      setError('장바구니에서 제거하는 중 오류가 발생했습니다.')
      return false
    }
  }, [supabase, user, refreshCart])

  // Clear entire cart
  const clearCart = useCallback(async (): Promise<boolean> => {
    if (!supabase || !user) {
      setError('로그인이 필요합니다.')
      return false
    }

    try {
      setError(null)
      
      const { data, error } = await supabase.rpc('clear_cart')

      if (error) {
        setError('장바구니를 비우는 중 오류가 발생했습니다.')
        return false
      }

      // Refresh cart data
      await refreshCart()
      return true

    } catch (err) {
      console.error('Error clearing cart:', err)
      setError('장바구니를 비우는 중 오류가 발생했습니다.')
      return false
    }
  }, [supabase, user, refreshCart])

  // Check if course is in cart
  const isInCart = useCallback((courseId: string): boolean => {
    return cartItems.some(item => item.course_id === courseId)
  }, [cartItems])

  // Validate cart for checkout
  const validateCart = useCallback(async () => {
    if (!supabase || !user) {
      return { isValid: false, invalidItems: [], message: '로그인이 필요합니다.' }
    }

    try {
      const { data, error } = await supabase.rpc('validate_cart_for_checkout')

      if (error) throw error

      const result = data?.[0] || { is_valid: false, invalid_items: [], message: '검증 실패' }
      
      return {
        isValid: result.is_valid,
        invalidItems: result.invalid_items || [],
        message: result.message || ''
      }

    } catch (err) {
      console.error('Error validating cart:', err)
      return { isValid: false, invalidItems: [], message: '장바구니 검증 중 오류가 발생했습니다.' }
    }
  }, [supabase, user])

  const contextValue: CartContextType = {
    cartItems,
    cartSummary,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    clearCart,
    refreshCart,
    isInCart,
    validateCart
  }

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}