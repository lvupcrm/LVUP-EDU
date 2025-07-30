'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/contexts/CartContext'

interface AddToCartButtonProps {
  courseId: string
  courseName?: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  showIcon?: boolean
  requireAuth?: boolean
}

export function AddToCartButton({
  courseId,
  courseName,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  showIcon = true,
  requireAuth = true
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { addToCart, isInCart, error } = useCart()
  const router = useRouter()

  const isAlreadyInCart = isInCart(courseId)

  const handleAddToCart = async () => {
    if (disabled || isAdding || isAlreadyInCart) return

    // Check if user needs to login
    if (requireAuth) {
      try {
        const { getSupabaseClient } = await import('@/lib/supabase')
        const supabase = getSupabaseClient()
        
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            router.push(`/auth/login?redirectTo=/courses/${courseId}`)
            return
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push(`/auth/login?redirectTo=/courses/${courseId}`)
        return
      }
    }

    setIsAdding(true)
    
    try {
      const success = await addToCart(courseId)
      
      if (success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2000)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  // Variant classes
  const variantClasses = {
    primary: isAlreadyInCart 
      ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
      : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: isAlreadyInCart
      ? 'border-2 border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500'
      : 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500'
  }

  // Disabled classes
  const disabledClasses = 'opacity-50 cursor-not-allowed'

  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${(disabled || isAdding) ? disabledClasses : ''}
    ${className}
  `.trim()

  // Button content
  const getButtonContent = () => {
    if (showSuccess) {
      return (
        <>
          {showIcon && <CheckIcon className="h-4 w-4 mr-2" />}
          추가됨!
        </>
      )
    }

    if (isAlreadyInCart) {
      return (
        <>
          {showIcon && <CheckIcon className="h-4 w-4 mr-2" />}
          장바구니에 있음
        </>
      )
    }

    if (isAdding) {
      return (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          추가 중...
        </>
      )
    }

    return (
      <>
        {showIcon && <ShoppingCartIcon className="h-4 w-4 mr-2" />}
        장바구니 담기
      </>
    )
  }

  return (
    <div className="space-y-1">
      <button
        onClick={handleAddToCart}
        disabled={disabled || isAdding || isAlreadyInCart}
        className={buttonClasses}
        aria-label={`${courseName || '강의'} 장바구니에 담기`}
      >
        {getButtonContent()}
      </button>
      
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}