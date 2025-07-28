import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

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