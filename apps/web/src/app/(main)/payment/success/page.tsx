'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { formatPrice } from '@/lib/toss-payments'

interface PaymentResult {
  success: boolean
  payment?: any
  order?: any
  error?: string
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [result, setResult] = useState<PaymentResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const paymentKey = searchParams.get('paymentKey')
  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')

  useEffect(() => {
    const confirmPayment = async () => {
      if (!paymentKey || !orderId || !amount) {
        setResult({ success: false, error: '결제 정보가 누락되었습니다.' })
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: parseInt(amount),
          }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setResult({
            success: true,
            payment: data.payment,
            order: data.order,
          })
        } else {
          setResult({
            success: false,
            error: data.error || '결제 승인에 실패했습니다.',
          })
        }
      } catch (error) {
        console.error('Payment confirmation error:', error)
        setResult({
          success: false,
          error: '결제 처리 중 오류가 발생했습니다.',
        })
      } finally {
        setIsLoading(false)
      }
    }

    confirmPayment()
  }, [paymentKey, orderId, amount])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">결제를 처리하고 있습니다...</p>
        </div>
      </div>
    )
  }

  if (!result || !result.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-soft p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">결제 실패</h1>
          <p className="text-gray-600 mb-6">{result?.error || '결제 처리 중 오류가 발생했습니다.'}</p>
          <button
            onClick={() => router.back()}
            className="btn-outline mr-3"
          >
            이전으로
          </button>
          <button
            onClick={() => router.push('/courses')}
            className="btn-primary"
          >
            강의 목록
          </button>
        </div>
      </div>
    )
  }

  const { payment, order } = result

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-soft p-8 text-center">
          {/* 성공 아이콘 */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </div>

          {/* 제목 */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">결제 완료!</h1>
          <p className="text-gray-600 mb-8">강의 수강이 시작되었습니다.</p>

          {/* 결제 정보 */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">결제 정보</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">주문번호</span>
                <span className="font-medium">{order?.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제수단</span>
                <span className="font-medium">{payment?.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제금액</span>
                <span className="font-medium text-primary-600">
                  {formatPrice(payment?.totalAmount)}원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제일시</span>
                <span className="font-medium">
                  {new Date(payment?.approvedAt).toLocaleString('ko-KR')}
                </span>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/courses/${order?.course_id}`)}
              className="w-full btn-primary"
            >
              강의 수강하기
            </button>
            <button
              onClick={() => router.push('/my/orders')}
              className="w-full btn-outline"
            >
              주문 내역 보기
            </button>
          </div>

          {/* 안내 메시지 */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              영수증은 이메일로 발송되며, 마이페이지에서도 확인하실 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">결제를 처리하고 있습니다...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}