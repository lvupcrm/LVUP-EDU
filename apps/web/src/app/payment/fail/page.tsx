'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { XCircleIcon } from '@heroicons/react/24/solid'

export default function PaymentFailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const errorCode = searchParams.get('code')
  const errorMessage = searchParams.get('message')
  const orderId = searchParams.get('orderId')

  const getErrorMessage = (code: string | null) => {
    switch (code) {
      case 'PAY_PROCESS_CANCELED':
        return '사용자가 결제를 취소했습니다.'
      case 'PAY_PROCESS_ABORTED':
        return '결제 진행 중 중단되었습니다.'
      case 'REJECT_CARD_COMPANY':
        return '카드사에서 결제를 거부했습니다.'
      case 'INSUFFICIENT_FUNDS':
        return '잔액이 부족합니다.'
      case 'NOT_SUPPORTED_INSTALLMENT':
        return '지원하지 않는 할부 개월 수입니다.'
      case 'EXCEED_MAX_CARD_INSTALLMENT_PLAN':
        return '설정 가능한 최대 할부 개월 수를 초과했습니다.'
      case 'INVALID_CARD_EXPIRATION':
        return '카드 유효기간을 확인해주세요.'
      case 'INVALID_STOPPED_CARD':
        return '정지된 카드입니다.'
      case 'EXCEED_MAX_DAILY_PAYMENT_COUNT':
        return '일일 결제 한도를 초과했습니다.'
      case 'NOT_MATCHED_CERTIFICATION':
        return '카드 소유자 인증에 실패했습니다.'
      case 'EXCEED_MAX_ONE_DAY_PAYMENT_AMOUNT':
        return '일일 결제 금액 한도를 초과했습니다.'
      case 'NOT_AVAILABLE_BANK':
        return '은행 서비스 시간이 아닙니다.'
      case 'INVALID_PASSWORD':
        return '결제 비밀번호가 일치하지 않습니다.'
      default:
        return errorMessage || '결제 처리 중 오류가 발생했습니다.'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-soft p-8 text-center">
        {/* 실패 아이콘 */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircleIcon className="w-12 h-12 text-red-600" />
        </div>

        {/* 제목 */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">결제 실패</h1>
        <p className="text-gray-600 mb-8">결제가 정상적으로 처리되지 않았습니다.</p>

        {/* 에러 정보 */}
        <div className="bg-red-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-lg font-semibold text-red-900 mb-4">실패 정보</h2>
          <div className="space-y-3">
            {orderId && (
              <div className="flex justify-between">
                <span className="text-red-600">주문번호</span>
                <span className="font-medium text-red-800">{orderId}</span>
              </div>
            )}
            {errorCode && (
              <div className="flex justify-between">
                <span className="text-red-600">오류코드</span>
                <span className="font-medium text-red-800">{errorCode}</span>
              </div>
            )}
            <div className="mt-4">
              <span className="text-red-600 text-sm block mb-2">실패 사유</span>
              <span className="font-medium text-red-800">
                {getErrorMessage(errorCode)}
              </span>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full btn-primary"
          >
            다시 결제하기
          </button>
          <button
            onClick={() => router.push('/courses')}
            className="w-full btn-outline"
          >
            강의 목록으로
          </button>
        </div>

        {/* 안내 메시지 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            문제가 지속되면 고객센터(1588-0000)로 문의해 주세요.
          </p>
        </div>
      </div>
    </div>
  )
}