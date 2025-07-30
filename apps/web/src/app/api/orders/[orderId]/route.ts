import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface RouteParams {
  params: {
    orderId: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // 서버사이드 Supabase 클라이언트 생성
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value
          },
        },
      }
    )

    // 인증된 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { orderId } = params

    if (!orderId) {
      return NextResponse.json(
        { error: '주문 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 주문 상세 정보 조회 (사용자 ID와 함께 조회하여 권한 확인)
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        order_id,
        user_id,
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
      .eq('user_id', user.id) // 현재 인증된 사용자의 주문만 조회
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

    // user_id 제거 후 응답
    const { user_id, ...orderWithoutUserId } = order
    
    return NextResponse.json({
      success: true,
      order: orderWithoutUserId,
    })

  } catch (error) {
    console.error('Order detail API error:', error)
    return NextResponse.json(
      { error: '주문 상세 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}