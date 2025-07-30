'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/toss-payments'
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid'

interface Order {
  id: string
  order_number: string
  order_id: string
  amount: number
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'
  payment_method?: string
  created_at: string
  paid_at?: string
  courses: {
    id: string
    title: string
    thumbnail?: string
  }
}

export default function OrderHistoryPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuthAndFetchOrders()
  }, [])

  const checkAuthAndFetchOrders = async () => {
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.')
      }

      // 인증된 사용자 확인
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !currentUser) {
        // 인증되지 않은 경우 로그인 페이지로 리다이렉트
        router.push('/auth/login?redirectTo=/my/orders')
        return
      }

      setUser(currentUser)
      await fetchOrders()
    } catch (error: any) {
      console.error('Authentication check failed:', error)
      setError(error.message)
      setIsLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // userId는 서버에서 인증된 사용자로부터 가져옴
      const response = await fetch('/api/orders')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '주문 내역을 불러오는데 실패했습니다.')
      }

      setOrders(data.orders)
    } catch (error: any) {
      console.error('Failed to fetch orders:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'CANCELLED':
      case 'REFUNDED':
        return <XCircleIcon className="w-5 h-5 text-red-600" />
      case 'PENDING':
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return '결제완료'
      case 'CANCELLED':
        return '주문취소'
      case 'REFUNDED':
        return '환불완료'
      case 'PENDING':
      default:
        return '결제대기'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600 bg-green-50'
      case 'CANCELLED':
      case 'REFUNDED':
        return 'text-red-600 bg-red-50'
      case 'PENDING':
      default:
        return 'text-yellow-600 bg-yellow-50'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">주문 내역을 불러오고 있습니다...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <XCircleIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">오류가 발생했습니다</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchOrders}
                className="btn-primary"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">주문 내역</h1>
            <p className="text-gray-600">결제한 강의와 주문 정보를 확인하세요.</p>
          </div>

          {/* 주문 목록 */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-soft p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">주문 내역이 없습니다</h3>
              <p className="text-gray-600 mb-6">아직 구매한 강의가 없습니다.</p>
              <button
                onClick={() => router.push('/courses')}
                className="btn-primary"
              >
                강의 둘러보기
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-soft p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-500">주문번호</span>
                        <span className="text-sm font-mono text-gray-900">{order.order_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {getStatusText(order.status)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                    {order.courses.thumbnail && (
                      <img
                        src={order.courses.thumbnail}
                        alt={order.courses.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{order.courses.title}</h3>
                      <p className="text-2xl font-bold text-primary-600">
                        {formatPrice(order.amount)}원
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {order.payment_method && (
                        <span>결제수단: {order.payment_method}</span>
                      )}
                      {order.paid_at && (
                        <span className="ml-4">
                          결제일: {new Date(order.paid_at).toLocaleDateString('ko-KR')}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {order.status === 'PAID' && (
                        <button
                          onClick={() => router.push(`/courses/${order.courses.id}`)}
                          className="btn-outline text-sm py-2 px-4"
                        >
                          강의 수강하기
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/my/orders/${order.id}`)}
                        className="btn-outline text-sm py-2 px-4"
                      >
                        상세보기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 (나중에 구현) */}
          {orders.length > 0 && (
            <div className="mt-8 flex justify-center">
              <div className="text-sm text-gray-600">
                총 {orders.length}개의 주문
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}