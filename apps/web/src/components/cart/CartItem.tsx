'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { TrashIcon } from '@heroicons/react/24/outline'
import { useCart, type CartItem as CartItemType } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/toss-payments'

interface CartItemProps {
  item: CartItemType
  onRemove?: () => void
  compact?: boolean // For dropdown vs full page
}

export function CartItem({ item, onRemove, compact = false }: CartItemProps) {
  const { removeFromCart, isLoading } = useCart()

  const handleRemove = async () => {
    const success = await removeFromCart(item.course_id)
    if (success && onRemove) {
      onRemove()
    }
  }

  const courseUrl = `/courses/${item.course_id}`
  const thumbnailUrl = item.course?.thumbnail || '/images/course-placeholder.jpg'

  if (compact) {
    // Compact version for dropdown
    return (
      <div className="p-3 hover:bg-gray-50 transition-colors">
        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          <Link href={courseUrl} className="flex-shrink-0">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
              <Image
                src={thumbnailUrl}
                alt={item.course?.title || '강의'}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <Link href={courseUrl}>
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary-600">
                {item.course?.title}
              </h4>
            </Link>
            <p className="text-xs text-gray-500 mt-1">
              {item.course?.instructor?.user?.name}
            </p>
            <p className="text-sm font-semibold text-primary-600 mt-1">
              {formatPrice(item.course?.price || 0)}원
            </p>
          </div>

          {/* Remove button */}
          <button
            onClick={handleRemove}
            disabled={isLoading}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
            title="장바구니에서 제거"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  // Full version for cart page
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <Link href={courseUrl} className="flex-shrink-0">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200">
            <Image
              src={thumbnailUrl}
              alt={item.course?.title || '강의'}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link href={courseUrl}>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-primary-600">
              {item.course?.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 mt-1">
            강사: {item.course?.instructor?.user?.name}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            장바구니 추가일: {new Date(item.added_at).toLocaleDateString('ko-KR')}
          </p>
        </div>

        {/* Price and actions */}
        <div className="flex-shrink-0 text-right">
          <p className="text-xl font-bold text-primary-600 mb-3">
            {formatPrice(item.course?.price || 0)}원
          </p>
          <div className="space-y-2">
            <Link
              href={courseUrl}
              className="block w-full px-3 py-1 text-sm text-primary-600 border border-primary-600 rounded hover:bg-primary-50 text-center"
            >
              강의 보기
            </Link>
            <button
              onClick={handleRemove}
              disabled={isLoading}
              className="w-full px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 disabled:opacity-50"
            >
              제거
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}