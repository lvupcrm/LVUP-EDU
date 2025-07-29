import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PaymentForm from '@/components/payment/PaymentForm'

interface PaymentPageProps {
  params: {
    courseId: string
  }
  searchParams: {
    userId?: string
  }
}

async function getCourseAndCreateOrder(courseId: string, userId: string) {
  // 강의 정보 조회
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, title, price, is_free, thumbnail')
    .eq('id', courseId)
    .single()

  if (courseError || !course) {
    return { error: '강의를 찾을 수 없습니다.' }
  }

  // 사용자 정보 조회
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('id', userId)
    .single()

  if (userError || !user) {
    return { error: '사용자 정보를 찾을 수 없습니다.' }
  }

  // 무료 강의인 경우 바로 리다이렉트
  if (course.is_free) {
    // 무료 강의 수강 등록 로직은 여기서 처리하거나 별도 API로 분리
    return { error: '무료 강의는 별도 결제가 필요하지 않습니다.', isFree: true }
  }

  // 이미 결제된 강의인지 확인
  const { data: existingEnrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('status', 'ACTIVE')
    .single()

  if (existingEnrollment) {
    return { error: '이미 수강 중인 강의입니다.', alreadyEnrolled: true }
  }

  return { course, user }
}

export default async function PaymentPage({ params, searchParams }: PaymentPageProps) {
  const { courseId } = params
  const { userId } = searchParams

  if (!userId) {
    redirect('/auth/login?returnUrl=/payment/' + courseId)
  }

  const result = await getCourseAndCreateOrder(courseId, userId)

  if (result.error) {
    if (result.isFree) {
      redirect(`/courses/${courseId}?message=free_course`)
    }
    if (result.alreadyEnrolled) {
      redirect(`/courses/${courseId}?message=already_enrolled`)
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">결제 오류</h1>
          <p className="text-gray-600 mb-6">{result.error}</p>
          <a
            href={`/courses/${courseId}`}
            className="btn-primary"
          >
            강의로 돌아가기
          </a>
        </div>
      </div>
    )
  }

  const { course, user } = result

  // 타입 안전성을 위한 체크
  if (!course || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">결제 정보 오류</h1>
          <p className="text-gray-600 mb-6">강의 또는 사용자 정보를 불러올 수 없습니다.</p>
          <a
            href={`/courses/${courseId}`}
            className="btn-primary"
          >
            강의로 돌아가기
          </a>
        </div>
      </div>
    )
  }

  // 주문 ID 생성 (실제로는 API를 통해 주문을 먼저 생성해야 함)
  const orderId = `LVUP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">강의 결제</h1>
          <p className="text-gray-600">안전하고 간편한 온라인 결제</p>
        </div>
        
        <PaymentForm 
          course={course}
          user={user}
          orderId={orderId}
        />
      </div>
    </div>
  )
}