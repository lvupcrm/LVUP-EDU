import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
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

    // Fetch cart items with course details
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        course:courses(
          id,
          title,
          price,
          thumbnail,
          instructor:instructors(
            user:users(name)
          )
        )
      `)
      .eq('user_id', user.id)
      .order('added_at', { ascending: false })

    if (error) {
      console.error('Error fetching cart items:', error)
      return NextResponse.json(
        { error: '장바구니를 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // Calculate summary
    const itemCount = cartItems?.length || 0
    const totalAmount = cartItems?.reduce((sum, item) => sum + (item.course?.price || 0), 0) || 0

    return NextResponse.json({
      items: cartItems || [],
      summary: {
        item_count: itemCount,
        total_amount: totalAmount
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { course_id } = body

    // Validate required fields
    if (!course_id) {
      return NextResponse.json(
        { error: '강의 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // Add to cart using database function
    const { data: cartItemId, error } = await supabase.rpc('add_to_cart', {
      target_course_id: course_id
    })

    if (error) {
      console.error('Error adding to cart:', error)
      if (error.message.includes('Already enrolled')) {
        return NextResponse.json(
          { error: '이미 수강 중인 강의입니다.' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: '장바구니에 추가하는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      cart_item_id: cartItemId
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    // Clear entire cart using database function
    const { data: deletedCount, error } = await supabase.rpc('clear_cart')

    if (error) {
      console.error('Error clearing cart:', error)
      return NextResponse.json(
        { error: '장바구니를 비우는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      deleted_count: deletedCount
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}