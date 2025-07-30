'use client'

import React from 'react'
import Link from 'next/link'
import { useNotifications } from '@/contexts/NotificationContext'
import { NotificationItem } from './NotificationItem'
import { CheckIcon, EyeIcon } from '@heroicons/react/24/outline'

interface NotificationDropdownProps {
  onClose: () => void
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { notifications, unreadCount, markAllAsRead, isLoading, error } = useNotifications()

  // Show only recent notifications (first 10)
  const recentNotifications = notifications.slice(0, 10)

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const handleViewAll = () => {
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
            알림 {unreadCount > 0 && `(${unreadCount}개의 새 알림)`}
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
              disabled={isLoading}
            >
              <CheckIcon className="h-3 w-3" />
              모두 읽음
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="py-8 px-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">알림을 불러오는 중...</p>
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <BellIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">새로운 알림이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {recentNotifications.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <Link
            href="/my/notifications"
            onClick={handleViewAll}
            className="flex items-center justify-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium w-full"
          >
            <EyeIcon className="h-4 w-4" />
            모든 알림 보기
          </Link>
        </div>
      )}
    </div>
  )
}

// Fallback BellIcon if not imported
function BellIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V5a5 5 0 00-10 0v12a5 5 0 0010 0z" />
    </svg>
  )
}