'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'
import { CartItem } from '@/components/cart/CartItem'
import { formatPrice } from '@/lib/toss-payments'
import { ShoppingCartIcon, CreditCardIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'

export default function CartPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  
  const router = useRouter()
  const { cartItems, cartSummary, isLoading: cartLoading, clearCart, validateCart } = useCart()
  const supabase = getSupabaseClient()

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        router.push('/auth/login?redirectTo=/cart')
        return
      }

      try {
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !currentUser) {
          router.push('/auth/login?redirectTo=/cart')
          return
        }

        setUser(currentUser)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth/login?redirectTo=/cart')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase, router])

  // Clear entire cart
  const handleClearCart = async () => {
    if (window.confirm('장바구니를 모두 비우시겠습니까?')) {
      await clearCart()
    }
  }

  // Proceed to checkout
  const handleCheckout = async () => {
    setIsValidating(true)
    setValidationError(null)

    try {
      const validation = await validateCart()
      
      if (!validation.isValid) {
        setValidationError(validation.message)
        
        // If there are invalid items, show details
        if (validation.invalidItems && validation.invalidItems.length > 0) {
          const invalidTitles = validation.invalidItems.map((item: any) => item.course_title).join(', ')
          setValidationError(`${validation.message}: ${invalidTitles}`)
        }
        return
      }

      // If cart is valid, create order and redirect to checkout
      if (cartItems.length === 1) {
        // Single item - redirect to existing payment flow
        router.push(`/payment/${cartItems[0].course_id}`)
      } else {
        // Multiple items - create bulk order (implement later)
        alert('다중 강의 결제는 곧 지원될 예정입니다.')
      }

    } catch (error) {
      console.error('Checkout validation error:', error)
      setValidationError('결제 전 검증 중 오류가 발생했습니다.')
    } finally {
      setIsValidating(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-6 w-48"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingCartIcon className="h-8 w-8 text-primary-600" />
              장바구니
            </h1>
            <p className="text-gray-600 mt-2">
              {cartSummary.item_count}개의 강의가 담겨있습니다
            </p>
          </div>
          
          {cartSummary.item_count > 0 && (
            <button
              onClick={handleClearCart}
              disabled={cartLoading}
              className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              <TrashIcon className="h-4 w-4" />
              모두 삭제
            </button>
          )}
        </div>

        {cartLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          // Empty cart
          <div className="text-center py-16">
            <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              장바구니가 비어있습니다
            </h2>
            <p className="text-gray-600 mb-8">
              원하는 강의를 장바구니에 담고 한번에 결제해보세요
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium"
            >
              강의 둘러보기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  주문 요약
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">강의 수</span>
                    <span className="font-medium">{cartSummary.item_count}개</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">소계</span>
                    <span className="font-medium">{formatPrice(cartSummary.total_amount)}원</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">총 결제금액</span>
                      <span className="text-xl font-bold text-primary-600">
                        {formatPrice(cartSummary.total_amount)}원
                      </span>
                    </div>
                  </div>
                </div>

                {/* Validation Error */}
                {validationError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-red-600">{validationError}</p>
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isValidating || cartLoading || cartSummary.item_count === 0}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  {isValidating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      검증 중...
                    </>
                  ) : (
                    <>
                      <CreditCardIcon className="h-5 w-5" />
                      결제하기
                    </>
                  )}
                </button>

                {/* Additional Info */}
                <div className="mt-6 space-y-2 text-xs text-gray-500">
                  <p>• 결제 후 즉시 수강이 가능합니다</p>
                  <p>• 강의는 평생 시청 가능합니다</p>
                  <p>• 환불 정책에 따라 환불이 가능합니다</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}