import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateOrderId } from '@/lib/toss-payments'

export async function POST(request: NextRequest) {
  try {
    const { courseId, userId } = await request.json()

    if (!courseId || !userId) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 1. 강의 정보 조회
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: '강의 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 2. 이미 수강 중인지 확인
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('status', 'ACTIVE')
      .single()

    if (existingEnrollment) {
      return NextResponse.json(
        { error: '이미 수강 중인 강의입니다.' },
        { status: 400 }
      )
    }

    // 3. 무료 강의인 경우 바로 수강 등록
    if (course.is_free) {
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: courseId,
          status: 'ACTIVE',
          enrolled_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (enrollmentError) {
        return NextResponse.json(
          { error: '수강 등록에 실패했습니다.' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        isFree: true,
        enrollment,
      })
    }

    // 4. 유료 강의인 경우 주문 생성
    const orderNumber = `LVUP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const orderId = generateOrderId(userId)

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        course_id: courseId,
        order_number: orderNumber,
        order_id: orderId,
        amount: course.price,
        original_amount: course.original_price || course.price,
        discount_amount: (course.original_price || course.price) - course.price,
        status: 'PENDING',
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json(
        { error: '주문 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      isFree: false,
      order,
      course: {
        id: course.id,
        title: course.title,
        price: course.price,
      },
    })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: '주문 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}