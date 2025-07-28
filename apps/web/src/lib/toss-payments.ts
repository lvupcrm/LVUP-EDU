import { loadTossPayments } from '@tosspayments/payment-sdk'

// 토스페이먼츠 클라이언트 키
const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!

// 토스페이먼츠 SDK 로드
export const getTossPayments = async () => {
  return await loadTossPayments(clientKey)
}

// 결제 요청 데이터 타입
export interface PaymentRequest {
  amount: number
  orderId: string
  orderName: string
  customerName?: string
  customerEmail?: string
  successUrl: string
  failUrl: string
}

// 결제 승인 데이터 타입
export interface PaymentApproval {
  paymentKey: string
  orderId: string
  amount: number
}

// 결제 정보 타입
export interface PaymentInfo {
  paymentKey: string
  orderId: string
  orderName: string
  method: string
  totalAmount: number
  balanceAmount: number
  status: string
  requestedAt: string
  approvedAt?: string
  receipt?: {
    url: string
  }
  checkout?: {
    url: string
  }
  currency: string
  failure?: {
    code: string
    message: string
  }
}

// 결제 메서드 타입 (TossPayments SDK 공식 타입)
export type PaymentMethod = '카드' | '가상계좌' | '간편결제' | '휴대폰' | '계좌이체' | '문화상품권' | '도서문화상품권' | '게임문화상품권'

// 주문 번호 생성 함수
export const generateOrderId = (userId: string): string => {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `LVUP-${timestamp}-${randomStr}`
}

// 금액 포맷팅 함수
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ko-KR').format(price)
}

// 결제 상태 한글 변환
export const getPaymentStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'READY': '결제 대기',
    'IN_PROGRESS': '결제 진행 중',
    'WAITING_FOR_DEPOSIT': '입금 대기',
    'DONE': '결제 완료',
    'CANCELED': '결제 취소',
    'PARTIAL_CANCELED': '부분 취소',
    'ABORTED': '결제 중단',
    'EXPIRED': '결제 만료'
  }
  return statusMap[status] || status
}

// 결제 수단 한글 변환
export const getPaymentMethodText = (method: string): string => {
  const methodMap: Record<string, string> = {
    '카드': '신용/체크카드',
    '가상계좌': '가상계좌 입금',
    '간편결제': '간편결제',
    '휴대폰': '휴대폰 결제',
    '계좌이체': '실시간 계좌이체',
    '문화상품권': '문화상품권',
    '도서문화상품권': '도서문화상품권',
    '게임문화상품권': '게임문화상품권'
  }
  return methodMap[method] || method
}