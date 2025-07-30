import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // 요청된 userId가 현재 인증된 사용자와 일치하는지 확인
    if (requestedUserId && requestedUserId !== user.id) {
      return NextResponse.json(
        { error: '다른 사용자의 주문 정보에는 접근할 수 없습니다.' },
        { status: 403 }
      )
    }

    // 현재 인증된 사용자의 ID 사용
    const userId = user.id

    // 주문 목록 조회 (강의 정보 포함)
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        order_id,
        amount,
        status,
        payment_method,
        created_at,
        paid_at,
        courses (
          id,
          title,
          thumbnail
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('Orders fetch error:', error)
      return NextResponse.json(
        { error: '주문 내역을 불러오는데 실패했습니다.' },
        { status: 500 }
      )
    }

    // 총 주문 수 조회
    const { count, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (countError) {
      console.error('Orders count error:', countError)
    }

    return NextResponse.json({
      success: true,
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })

  } catch (error) {
    console.error('Orders API error:', error)
    return NextResponse.json(
      { error: '주문 내역 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}