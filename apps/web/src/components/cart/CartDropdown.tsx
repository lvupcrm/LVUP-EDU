'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { CartItem } from './CartItem'
import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline'
import { formatPrice } from '@/lib/toss-payments'

interface CartDropdownProps {
  onClose: () => void
}

export function CartDropdown({ onClose }: CartDropdownProps) {
  const { cartItems, cartSummary, isLoading, error, clearCart } = useCart()

  const handleClearCart = async () => {
    if (window.confirm('장바구니를 모두 비우시겠습니까?')) {
      await clearCart()
    }
  }

  const handleViewCart = () => {
    onClose()
  }

  const handleCheckout = () => {
    onClose()
  }

  if (error) {
    return (
      <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-6 px-4">
        <div className="text-center text-red-600">
          <p className="text-sm">{error}</p>
          <button 
            onClick={onClose}
            className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            장바구니 ({cartSummary.item_count}개)
          </h3>
          {cartSummary.item_count > 0 && (
            <button
              onClick={handleClearCart}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
              disabled={isLoading}
            >
              <TrashIcon className="h-3 w-3" />
              모두 삭제
            </button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="py-8 px-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">장바구니를 불러오는 중...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <ShopIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">장바구니가 비어있습니다</p>
            <p className="text-xs text-gray-400 mt-1">원하는 강의를 장바구니에 담아보세요</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onRemove={() => {/* handled in CartItem */}}
                compact={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {cartItems.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          {/* Total */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-900">총 금액</span>
            <span className="text-lg font-bold text-primary-600">
              {formatPrice(cartSummary.total_amount)}원
            </span>
          </div>
          
          {/* Actions */}
          <div className="space-y-2">
            <Link
              href="/cart"
              onClick={handleCheckout}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 font-medium text-sm text-center block"
            >
              결제하기
            </Link>
            <Link
              href="/cart"
              onClick={handleViewCart}
              className="flex items-center justify-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium w-full"
            >
              <EyeIcon className="h-4 w-4" />
              장바구니 상세보기
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// Fallback ShopIcon if not imported
function ShopIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
    </svg>
  )
}