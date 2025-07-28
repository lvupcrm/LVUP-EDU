'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/toss-payments'
import { CheckCircleIcon, XCircleIcon, ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/solid'

interface OrderDetail {
  id: string
  order_number: string
  order_id: string
  amount: number
  original_amount: number
  discount_amount: number
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'
  payment_method?: string
  payment_key?: string
  created_at: string
  paid_at?: string
  courses: {
    id: string
    title: string
    description: string
    thumbnail?: string
    instructor_profiles: {
      user: {
        name: string
      }
    }
  }
  payments?: {
    id: string
    method: string
    amount: number
    status: string
    approved_at: string
    raw_data: any
  }[]
}

interface OrderDetailPageProps {
  params: {
    orderId: string
  }
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrderDetail()
  }, [params.orderId])

  const fetchOrderDetail = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/orders/${params.orderId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '주문 상세 정보를 불러오는데 실패했습니다.')
      }

      setOrder(data.order)
    } catch (error: any) {
      console.error('Failed to fetch order detail:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircleIcon className="w-6 h-6 text-green-600" />
      case 'CANCELLED':
      case 'REFUNDED':
        return <XCircleIcon className="w-6 h-6 text-red-600" />
      case 'PENDING':
      default:
        return <ClockIcon className="w-6 h-6 text-yellow-600" />
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
        return 'text-green-600 bg-green-50 border-green-200'
      case 'CANCELLED':
      case 'REFUNDED':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'PENDING':
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">주문 상세 정보를 불러오고 있습니다...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center py-12">
              <XCircleIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">오류가 발생했습니다</h2>
              <p className="text-gray-600 mb-6">{error || '주문 정보를 찾을 수 없습니다.'}</p>
              <button
                onClick={() => router.push('/my/orders')}
                className="btn-primary"
              >
                주문 목록으로
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
        <div className="max-w-3xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              뒤로 가기
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">주문 상세</h1>
            <p className="text-gray-600">주문 #{order.order_number}</p>
          </div>

          <div className="space-y-6">
            {/* 주문 상태 */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">주문 상태</h2>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {getStatusText(order.status)}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">주문일시</span>
                  <p className="font-medium">
                    {new Date(order.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
                {order.paid_at && (
                  <div>
                    <span className="text-sm text-gray-500">결제일시</span>
                    <p className="font-medium">
                      {new Date(order.paid_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 강의 정보 */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">강의 정보</h2>
              <div className="flex items-start gap-4">
                {order.courses.thumbnail && (
                  <img
                    src={order.courses.thumbnail}
                    alt={order.courses.title}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {order.courses.title}
                  </h3>
                  <p className="text-gray-600 mb-2 line-clamp-2">
                    {order.courses.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    강사: {order.courses.instructor_profiles?.user?.name}
                  </p>
                </div>
              </div>
              {order.status === 'PAID' && (
                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => router.push(`/courses/${order.courses.id}`)}
                    className="btn-primary"
                  >
                    강의 수강하기
                  </button>
                </div>
              )}
            </div>

            {/* 결제 정보 */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">결제 정보</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">강의 가격</span>
                  <span className="font-medium">
                    {formatPrice(order.original_amount)}원
                  </span>
                </div>
                
                {order.discount_amount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">할인 금액</span>
                    <span className="font-medium text-red-600">
                      -{formatPrice(order.discount_amount)}원
                    </span>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">총 결제 금액</span>
                    <span className="text-xl font-bold text-primary-600">
                      {formatPrice(order.amount)}원
                    </span>
                  </div>
                </div>

                {order.payment_method && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">결제 수단</span>
                      <span className="font-medium">{order.payment_method}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 결제 상세 (결제 완료 시에만 표시) */}
            {order.payments && order.payments.length > 0 && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">결제 상세</h2>
                {order.payments.map((payment) => (
                  <div key={payment.id} className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">결제 승인 번호</span>
                      <span className="font-mono text-sm">{payment.raw_data?.paymentKey}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">카드 정보</span>
                      <span className="font-medium">
                        {payment.raw_data?.card?.company} 
                        {payment.raw_data?.card?.number && ` ****-${payment.raw_data.card.number.slice(-4)}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}