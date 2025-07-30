'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

// Notification types
export interface Notification {
  id: string
  user_id: string
  type: 'course_update' | 'new_lesson' | 'enrollment_success' | 'payment_success' | 'payment_failed' | 'refund_processed' | 'lesson_completed' | 'course_completed' | 'certificate_issued' | 'assignment_due' | 'system_maintenance' | 'instructor_message'
  title: string
  message: string
  data: Record<string, any>
  is_read: boolean
  created_at: string
  read_at?: string
}

// Context types
interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  fetchNotifications: () => Promise<void>
  createNotification: (notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'is_read' | 'read_at'>) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: React.ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  const supabase = getSupabaseClient()

  // Initialize user and notifications
  useEffect(() => {
    if (!supabase) return

    const initializeNotifications = async () => {
      try {
        // Get current user
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !currentUser) {
          setUser(null)
          setIsLoading(false)
          return
        }

        setUser(currentUser)
        await fetchNotifications()
      } catch (err) {
        console.error('Error initializing notifications:', err)
        setError('알림을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    initializeNotifications()
  }, [supabase])

  // Set up realtime subscription
  useEffect(() => {
    if (!supabase || !user) return

    const setupRealtimeSubscription = () => {
      const notificationChannel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('New notification received:', payload)
            const newNotification = payload.new as Notification
            setNotifications(prev => [newNotification, ...prev])
            if (!newNotification.is_read) {
              setUnreadCount(prev => prev + 1)
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Notification updated:', payload)
            const updatedNotification = payload.new as Notification
            setNotifications(prev => 
              prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
            )
            
            // Update unread count
            if (updatedNotification.is_read && !payload.old?.is_read) {
              setUnreadCount(prev => Math.max(0, prev - 1))
            }
          }
        )
        .subscribe((status) => {
          console.log('Notification channel status:', status)
        })

      setChannel(notificationChannel)
    }

    setupRealtimeSubscription()

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        console.log('Cleaning up notification channel')
        supabase.removeChannel(channel)
      }
    }
  }, [supabase, user])

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    if (!supabase || !user) return

    try {
      setError(null)
      
      // Fetch recent notifications (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setNotifications(data || [])
      
      // Count unread notifications
      const unread = (data || []).filter(n => !n.is_read).length
      setUnreadCount(unread)

    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError('알림을 불러오는 중 오류가 발생했습니다.')
    }
  }, [supabase, user])

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!supabase) return

    try {
      const { error } = await supabase.rpc('mark_notification_read', {
        notification_id: notificationId
      })

      if (error) throw error

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      )
      
      setUnreadCount(prev => Math.max(0, prev - 1))

    } catch (err) {
      console.error('Error marking notification as read:', err)
      setError('알림을 읽음 처리하는 중 오류가 발생했습니다.')
    }
  }, [supabase])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!supabase) return

    try {
      const { data: updatedCount, error } = await supabase.rpc('mark_all_notifications_read')

      if (error) throw error

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      )
      
      setUnreadCount(0)

      console.log(`Marked ${updatedCount} notifications as read`)

    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      setError('알림을 읽음 처리하는 중 오류가 발생했습니다.')
    }
  }, [supabase])

  // Create new notification (for testing or system use)
  const createNotification = useCallback(async (
    notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'is_read' | 'read_at'>
  ) => {
    if (!supabase || !user) return

    try {
      const { data, error } = await supabase.rpc('create_notification', {
        target_user_id: user.id,
        notification_type: notification.type,
        notification_title: notification.title,
        notification_message: notification.message,
        notification_data: notification.data
      })

      if (error) throw error

      console.log('Notification created:', data)

    } catch (err) {
      console.error('Error creating notification:', err)
      setError('알림을 생성하는 중 오류가 발생했습니다.')
    }
  }, [supabase, user])

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    createNotification
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

// Custom hook to use notification context
export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}