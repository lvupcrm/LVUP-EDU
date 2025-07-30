'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useNotifications, type Notification } from '@/contexts/NotificationContext'
import {
  AcademicCapIcon,
  PlayIcon,
  CheckCircleIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  TrophyIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

interface NotificationItemProps {
  notification: Notification
  onClose?: () => void
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const { markAsRead } = useNotifications()
  const router = useRouter()

  // Get icon based on notification type
  const getNotificationIcon = (type: Notification['type']) => {
    const iconClass = `h-5 w-5 ${notification.is_read ? 'text-gray-400' : 'text-primary-600'}`
    
    switch (type) {
      case 'course_update':
        return <AcademicCapIcon className={iconClass} />
      case 'new_lesson':
        return <PlayIcon className={iconClass} />
      case 'enrollment_success':
        return <CheckCircleIcon className={`h-5 w-5 ${notification.is_read ? 'text-gray-400' : 'text-green-600'}`} />
      case 'payment_success':
        return <CreditCardIcon className={`h-5 w-5 ${notification.is_read ? 'text-gray-400' : 'text-green-600'}`} />
      case 'payment_failed':
        return <ExclamationTriangleIcon className={`h-5 w-5 ${notification.is_read ? 'text-gray-400' : 'text-red-600'}`} />
      case 'refund_processed':
        return <BanknotesIcon className={`h-5 w-5 ${notification.is_read ? 'text-gray-400' : 'text-blue-600'}`} />
      case 'lesson_completed':
      case 'course_completed':
        return <CheckCircleIcon className={`h-5 w-5 ${notification.is_read ? 'text-gray-400' : 'text-green-600'}`} />
      case 'certificate_issued':
        return <TrophyIcon className={`h-5 w-5 ${notification.is_read ? 'text-gray-400' : 'text-yellow-600'}`} />
      case 'assignment_due':
        return <ClockIcon className={`h-5 w-5 ${notification.is_read ? 'text-gray-400' : 'text-orange-600'}`} />
      case 'system_maintenance':
        return <WrenchScrewdriverIcon className={`h-5 w-5 ${notification.is_read ? 'text-gray-400' : 'text-gray-600'}`} />
      case 'instructor_message':
        return <ChatBubbleLeftRightIcon className={iconClass} />
      default:
        return <CheckCircleIcon className={iconClass} />
    }
  }

  // Get navigation URL based on notification type and data
  const getNavigationUrl = (): string | null => {
    const { data } = notification
    
    switch (notification.type) {
      case 'course_update':
      case 'new_lesson':
        return data.course_id ? `/courses/${data.course_id}` : null
      case 'enrollment_success':
        return data.course_id ? `/courses/${data.course_id}` : '/my/courses'
      case 'payment_success':
      case 'payment_failed':
        return data.order_id ? `/my/orders/${data.order_id}` : '/my/orders'
      case 'refund_processed':
        return '/my/orders'
      case 'lesson_completed':
        return data.lesson_id && data.course_id 
          ? `/courses/${data.course_id}/lesson/${data.lesson_id}` 
          : data.course_id 
          ? `/courses/${data.course_id}` 
          : '/my/courses'
      case 'course_completed':
        return data.course_id ? `/courses/${data.course_id}` : '/my/courses'
      case 'certificate_issued':
        return data.certificate_id ? `/certificates/${data.certificate_id}` : '/certificates'
      case 'assignment_due':
        return data.course_id ? `/courses/${data.course_id}` : null
      case 'instructor_message':
        return data.course_id ? `/courses/${data.course_id}/qa` : null
      default:
        return null
    }
  }

  // Format relative time
  const getRelativeTime = (dateString: string): string => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return '방금 전'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}분 전`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}시간 전`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}일 전`
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const handleClick = async () => {
    // Mark as read if not already read
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }

    // Navigate to appropriate page
    const url = getNavigationUrl()
    if (url) {
      router.push(url)
    }

    // Close dropdown if callback provided
    if (onClose) {
      onClose()
    }
  }

  const navigationUrl = getNavigationUrl()

  const content = (
    <div 
      className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer ${
        !notification.is_read ? 'bg-blue-50' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                notification.is_read ? 'text-gray-700' : 'text-gray-900'
              } line-clamp-2`}>
                {notification.title}
              </p>
              <p className={`text-xs mt-1 ${
                notification.is_read ? 'text-gray-500' : 'text-gray-600'
              } line-clamp-2`}>
                {notification.message}
              </p>
            </div>
            
            {/* Unread indicator */}
            {!notification.is_read && (
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {getRelativeTime(notification.created_at)}
            </span>
            
            {/* Action hint */}
            {navigationUrl && (
              <span className="text-xs text-primary-600 font-medium">
                보기 →
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // If there's a navigation URL, wrap in Link, otherwise just return the content
  if (navigationUrl) {
    return (
      <Link href={navigationUrl} onClick={onClose}>
        {content}
      </Link>
    )
  }

  return content
}