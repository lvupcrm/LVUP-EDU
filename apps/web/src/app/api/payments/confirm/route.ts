import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateServerEnv } from '@/lib/env-validation'

// 토스페이먼츠 결제 승인 API
export async function POST(request: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await request.json()

    // 1. 토스페이먼츠 결제 승인 요청
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from((validateServerEnv().TOSS_SECRET_KEY) + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    })

    const paymentData = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: paymentData.message || '결제 승인에 실패했습니다.' },
        { status: response.status }
      )
    }

    // 2. 주문 정보 조회
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: '주문 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 3. 결제 내역 저장
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        payment_key: paymentKey,
        order_id_toss: orderId,
        method: paymentData.method,
        amount: paymentData.totalAmount,
        status: paymentData.status,
        requested_at: paymentData.requestedAt,
        approved_at: paymentData.approvedAt,
        raw_data: paymentData,
      })

    if (paymentError) {
      console.error('Payment save error:', paymentError)
      return NextResponse.json(
        { error: '결제 정보 저장에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 4. 주문 상태 업데이트
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({
        status: 'PAID',
        payment_key: paymentKey,
        payment_method: paymentData.method,
        paid_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    if (orderUpdateError) {
      console.error('Order update error:', orderUpdateError)
      return NextResponse.json(
        { error: '주문 상태 업데이트에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 5. 수강 등록 생성
    const { error: enrollmentError } = await supabase
      .from('enrollments')
      .insert({
        user_id: order.user_id,
        course_id: order.course_id,
        order_id: order.id,
        status: 'ACTIVE',
        enrolled_at: new Date().toISOString(),
      })

    if (enrollmentError) {
      console.error('Enrollment error:', enrollmentError)
      // 수강 등록 실패 시에도 결제는 완료된 상태로 처리
    }

    return NextResponse.json({
      success: true,
      payment: paymentData,
      order: order,
    })

  } catch (error) {
    console.error('Payment confirmation error:', error)
    return NextResponse.json(
      { error: '결제 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}