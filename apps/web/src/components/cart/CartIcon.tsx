'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import { ShoppingCartIcon as ShoppingCartSolidIcon } from '@heroicons/react/24/solid'
import { useCart } from '@/contexts/CartContext'
import { CartDropdown } from './CartDropdown'

export function CartIcon() {
  const [isOpen, setIsOpen] = useState(false)
  const { cartSummary, isLoading } = useCart()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Don't render if still loading
  if (isLoading) {
    return (
      <div className="relative">
        <button
          className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
          disabled
        >
          <ShoppingCartIcon className="h-6 w-6" />
        </button>
      </div>
    )
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const itemCount = cartSummary.item_count

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg transition-colors"
        aria-label={`장바구니 ${itemCount > 0 ? `(${itemCount}개 상품)` : ''}`}
      >
        {itemCount > 0 ? (
          <ShoppingCartSolidIcon className="h-6 w-6 text-primary-600" />
        ) : (
          <ShoppingCartIcon className="h-6 w-6" />
        )}
        
        {/* Cart badge */}
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] animate-pulse">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
        
        {/* Pulse animation for new items */}
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-5 w-5 animate-ping opacity-75"></span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 z-50"
        >
          <CartDropdown onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  )
}