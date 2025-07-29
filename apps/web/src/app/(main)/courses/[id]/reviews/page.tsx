import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReviewList from '@/components/review/ReviewList'
import ReviewStats from '@/components/review/ReviewStats'
import WriteReviewButton from '@/components/review/WriteReviewButton'

interface PageProps {
  params: {
    id: string
  }
  searchParams: {
    sort?: 'latest' | 'helpful' | 'rating_high' | 'rating_low'
    filter?: string
  }
}

export default async function CourseReviewsPage({ params, searchParams }: PageProps) {
  const sort = searchParams.sort || 'latest'
  const ratingFilter = searchParams.filter

  // 코스 정보 가져오기
  const { data: course } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      average_rating,
      review_count
    `)
    .eq('id', params.id)
    .single()

  if (!course) {
    notFound()
  }

  // 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser()

  // 수강 상태 및 기존 리뷰 확인
  let enrollment = null
  let existingReview = null

  if (user) {
    const { data: enrollmentData } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', params.id)
      .single()
    
    enrollment = enrollmentData

    if (enrollment) {
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', params.id)
        .single()
      
      existingReview = reviewData
    }
  }

  // 리뷰 목록 가져오기
  let query = supabase
    .from('reviews')
    .select(`
      *,
      user:users(id, name, avatar),
      review_helpful(user_id)
    `)
    .eq('course_id', params.id)

  // 평점 필터 적용
  if (ratingFilter) {
    query = query.eq('rating', parseInt(ratingFilter))
  }

  // 정렬 적용
  if (sort === 'latest') {
    query = query.order('created_at', { ascending: false })
  } else if (sort === 'helpful') {
    query = query.order('helpful_count', { ascending: false })
  } else if (sort === 'rating_high') {
    query = query.order('rating', { ascending: false })
  } else if (sort === 'rating_low') {
    query = query.order('rating', { ascending: true })
  }

  const { data: reviews } = await query

  // 평점별 통계 계산
  const ratingStats = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews?.filter(r => r.rating === rating).length || 0
    const percentage = reviews && reviews.length > 0 
      ? (count / reviews.length) * 100 
      : 0
    return { rating, count, percentage }
  })

  const canWriteReview = enrollment && 
    (enrollment.progress >= 20 || enrollment.status === 'COMPLETED') && 
    !existingReview

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href={`/courses/${params.id}`}
            className="text-gray-600 hover:text-gray-900 text-sm mb-4 inline-block"
          >
            ← {course.title}로 돌아가기
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">수강평</h1>
              <p className="text-gray-600 mt-2">
                실제 수강생들의 생생한 후기를 확인해보세요
              </p>
            </div>
            
            <WriteReviewButton
              courseId={params.id}
              canWrite={canWriteReview}
              enrollmentProgress={enrollment?.progress || 0}
              hasExistingReview={!!existingReview}
              existingReviewId={existingReview?.id}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 평점 통계 */}
          <div className="lg:col-span-1">
            <ReviewStats
              averageRating={course.average_rating || 0}
              totalReviews={course.review_count || 0}
              ratingStats={ratingStats}
              currentFilter={ratingFilter}
              courseId={params.id}
            />
          </div>

          {/* 리뷰 목록 */}
          <div className="lg:col-span-3">
            <ReviewList
              reviews={reviews || []}
              currentUser={user}
              courseId={params.id}
              currentSort={sort}
            />
          </div>
        </div>
      </div>
    </div>
  )
}