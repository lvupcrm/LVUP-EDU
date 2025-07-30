import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

interface Params {
  courseId: string
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    // Create Supabase client with server-side auth
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

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const courseId = params.courseId

    // Remove from cart using database function
    const { data: success, error } = await supabase.rpc('remove_from_cart', {
      target_course_id: courseId
    })

    if (error) {
      console.error('Error removing from cart:', error)
      return NextResponse.json(
        { error: '장바구니에서 제거하는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      removed: success
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}