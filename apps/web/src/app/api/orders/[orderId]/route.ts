import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface RouteParams {
  params: {
    orderId: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = params

    if (!orderId) {
      return NextResponse.json(
        { error: '주문 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 주문 상세 정보 조회 (강의, 결제 정보 포함)
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        order_id,
        amount,
        original_amount,
        discount_amount,
        status,
        payment_method,
        payment_key,
        created_at,
        paid_at,
        courses (
          id,
          title,
          description,
          thumbnail,
          instructor_profiles (
            user:users (
              name
            )
          )
        ),
        payments (
          id,
          method,
          amount,
          status,
          approved_at,
          raw_data
        )
      `)
      .eq('id', orderId)
      .single()

    if (error) {
      console.error('Order detail fetch error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '주문을 찾을 수 없습니다.' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: '주문 상세 정보를 불러오는데 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order,
    })

  } catch (error) {
    console.error('Order detail API error:', error)
    return NextResponse.json(
      { error: '주문 상세 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}