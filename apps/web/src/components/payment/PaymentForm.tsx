'use client'

import { useState, useEffect } from 'react'
import { getTossPayments, PaymentRequest, formatPrice, PaymentMethod } from '@/lib/toss-payments'
import { CreditCardIcon, BanknotesIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline'

interface PaymentFormProps {
  course: {
    id: string
    title: string
    price: number
    thumbnail?: string
  }
  user: {
    id: string
    name: string
    email: string
  }
  orderId: string
}

export default function PaymentForm({ course, user, orderId }: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('카드')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const paymentMethods: { id: PaymentMethod; name: string; icon: any; description: string }[] = [
    { id: '카드', name: '신용/체크카드', icon: CreditCardIcon, description: '간편하고 빠른 카드 결제' },
    { id: '가상계좌', name: '가상계좌', icon: BanknotesIcon, description: '가상계좌로 안전한 입금' },
    { id: '간편결제', name: '간편결제', icon: DevicePhoneMobileIcon, description: '토스, 페이팔 등 간편결제' },
  ]

  const handlePayment = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // 1. 토스페이먼츠 SDK 로드
      const tossPayments = await getTossPayments()

      // 2. 결제 요청 데이터 구성
      const paymentData: PaymentRequest = {
        amount: course.price,
        orderId: orderId,
        orderName: course.title,
        customerName: user.name,
        customerEmail: user.email,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      }

      // 3. 결제 요청
      await tossPayments.requestPayment(selectedMethod as any, paymentData)

    } catch (error: any) {
      console.error('Payment error:', error)
      setError(error.message || '결제 요청 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-soft p-8">
      {/* 강의 정보 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">결제 정보</h2>
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          {course.thumbnail && (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{course.title}</h3>
            <p className="text-2xl font-bold text-primary-600">
              {formatPrice(course.price)}원
            </p>
          </div>
        </div>
      </div>

      {/* 결제 수단 선택 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">결제 수단 선택</h3>
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const IconComponent = method.icon
            return (
              <label
                key={method.id}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === method.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
                  className="sr-only"
                />
                <IconComponent className="h-6 w-6 text-gray-400 mr-3" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{method.name}</div>
                  <div className="text-sm text-gray-500">{method.description}</div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedMethod === method.id
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300'
                }`}>
                  {selectedMethod === method.id && (
                    <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                  )}
                </div>
              </label>
            )
          })}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* 결제 버튼 */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-medium text-gray-900">총 결제 금액</span>
          <span className="text-2xl font-bold text-primary-600">
            {formatPrice(course.price)}원
          </span>
        </div>
        
        <button
          onClick={handlePayment}
          disabled={isLoading}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              결제 처리 중...
            </div>
          ) : (
            `${formatPrice(course.price)}원 결제하기`
          )}
        </button>
      </div>

      {/* 결제 안내 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">결제 안내</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 결제 완료 후 즉시 수강이 가능합니다.</li>
          <li>• 결제 관련 문의는 고객센터로 연락해 주세요.</li>
          <li>• 환불 정책에 따라 부분 환불이 가능합니다.</li>
        </ul>
      </div>
    </div>
  )
}