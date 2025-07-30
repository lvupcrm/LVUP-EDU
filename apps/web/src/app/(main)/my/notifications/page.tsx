'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { useNotifications, type Notification } from '@/contexts/NotificationContext'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import { CheckIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [allNotifications, setAllNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  const router = useRouter()
  const { markAllAsRead, isLoading: contextLoading } = useNotifications()
  const supabase = getSupabaseClient()

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        router.push('/auth/login?redirectTo=/my/notifications')
        return
      }

      try {
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !currentUser) {
          router.push('/auth/login?redirectTo=/my/notifications')
          return
        }

        setUser(currentUser)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/auth/login?redirectTo=/my/notifications')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase, router])

  // Fetch notifications
  const fetchNotifications = async (pageNum: number = 1, append: boolean = false) => {
    if (!user) return

    try {
      if (!append) setIsLoadingMore(true)

      const response = await fetch(`/api/notifications?page=${pageNum}&limit=20`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '알림을 불러오는 중 오류가 발생했습니다.')
      }

      if (append) {
        setAllNotifications(prev => [...prev, ...data.notifications])
      } else {
        setAllNotifications(data.notifications)
      }

      setTotalPages(data.pagination.totalPages)
      setPage(pageNum)

    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchNotifications(1)
    }
  }, [user])

  // Delete notification
  const handleDelete = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '알림을 삭제하는 중 오류가 발생했습니다.')
      }

      // Remove from local state
      setAllNotifications(prev => prev.filter(n => n.id !== notificationId))

    } catch (error) {
      console.error('Error deleting notification:', error)
      alert('알림 삭제 중 오류가 발생했습니다.')
    }
  }

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      // Refresh notifications
      fetchNotifications(1)
    } catch (error) {
      console.error('Error marking all as read:', error)
      alert('알림을 읽음 처리하는 중 오류가 발생했습니다.')
    }
  }

  // Load more notifications
  const handleLoadMore = () => {
    if (page < totalPages && !isLoadingMore) {
      fetchNotifications(page + 1, true)
    }
  }

  // Filter notifications
  const filteredNotifications = allNotifications.filter(notification => {
    if (filter === 'unread') {
      return !notification.is_read
    }
    return true
  })

  if (loading) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-6 w-48"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const unreadCount = allNotifications.filter(n => !n.is_read).length

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">알림</h1>
            <p className="text-gray-600 mt-1">
              총 {allNotifications.length}개의 알림 ({unreadCount}개 읽지 않음)
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={contextLoading}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <CheckIcon className="h-4 w-4" />
              모두 읽음
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              filter === 'all'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            전체 ({allNotifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              filter === 'unread'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            읽지 않음 ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'unread' ? '읽지 않은 알림이 없습니다' : '알림이 없습니다'}
            </h3>
            <p className="text-gray-500">
              {filter === 'unread' 
                ? '모든 알림을 확인했습니다.'
                : '새로운 알림이 오면 여기에 표시됩니다.'
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {filteredNotifications.map((notification, index) => (
              <div key={notification.id} className="relative group">
                <NotificationItem notification={notification} />
                
                {/* Delete button */}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="알림 삭제"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
                
                {index < filteredNotifications.length - 1 && (
                  <div className="border-b border-gray-100" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {page < totalPages && (
          <div className="text-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              {isLoadingMore ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  불러오는 중...
                </div>
              ) : (
                `더 보기 (${page}/${totalPages})`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}