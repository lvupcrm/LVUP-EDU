import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ClockIcon, 
  AcademicCapIcon, 
  UsersIcon, 
  StarIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { LessonList } from '@/components/course/LessonList'
import { AddToCartButton } from '@/components/cart/AddToCartButton'

interface PageProps {
  params: {
    id: string
  }
}

export default async function CoursePage({ params }: PageProps) {
  // 코스 정보 가져오기
  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:instructor_profiles(
        id,
        bio,
        experience_years,
        user:users(
          id,
          name,
          avatar
        )
      ),
      category:categories(
        id,
        name,
        slug
      ),
      lessons(
        id,
        title,
        description,
        order_num,
        duration,
        is_preview,
        video_url
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !course) {
    notFound()
  }

  // 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser()
  
  // 수강 상태 확인
  let enrollment = null
  let lessonProgress = []
  
  if (user) {
    const { data: enrollmentData } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', params.id)
      .single()
    
    enrollment = enrollmentData

    // 진도 정보 가져오기
    if (enrollment) {
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('enrollment_id', enrollment.id)
      
      lessonProgress = progressData || []
    }
  }

  const isEnrolled = !!enrollment

  // 강사의 다른 강의 가져오기
  const { data: otherCourses } = await supabase
    .from('courses')
    .select('id, title, thumbnail, price')
    .eq('instructor_id', course.instructor_id)
    .neq('id', params.id)
    .limit(3)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIcon key={i} className="h-5 w-5 text-yellow-400" />)
      } else {
        stars.push(<StarIcon key={i} className="h-5 w-5 text-gray-300" />)
      }
    }
    return stars
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* 카테고리 */}
              <div className="flex items-center text-sm mb-4">
                <Link href="/courses" className="hover:text-primary-400">
                  전체 강의
                </Link>
                <span className="mx-2">/</span>
                <Link 
                  href={`/courses/category/${course.category?.slug}`}
                  className="hover:text-primary-400"
                >
                  {course.category?.name}
                </Link>
              </div>

              {/* 제목 */}
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                {course.title}
              </h1>

              {/* 부제목 */}
              {course.subtitle && (
                <p className="text-xl text-gray-300 mb-6">
                  {course.subtitle}
                </p>
              )}

              {/* 평점 및 수강생 */}
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {renderStars(course.average_rating || 0)}
                  </div>
                  <span className="font-semibold">
                    {course.average_rating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-gray-400 ml-1">
                    ({course.review_count || 0}개의 리뷰)
                  </span>
                </div>
                <div className="text-gray-400">
                  <UsersIcon className="h-5 w-5 inline mr-1" />
                  {course.enrollment_count || 0}명의 수강생
                </div>
              </div>

              {/* 강사 정보 */}
              <div className="flex items-center">
                <Image
                  src={course.instructor?.user?.avatar || '/default-avatar.svg'}
                  alt={course.instructor?.user?.name}
                  width={48}
                  height={48}
                  className="rounded-full mr-3"
                />
                <div>
                  <p className="text-sm text-gray-400">강사</p>
                  <Link 
                    href={`/instructor/${course.instructor_id}`}
                    className="font-semibold hover:text-primary-400"
                  >
                    {course.instructor?.user?.name}
                  </Link>
                </div>
              </div>
            </div>

            {/* 썸네일 */}
            <div className="lg:col-span-1">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={course.thumbnail || '/default-course.svg'}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                {course.preview_video && (
                  <button className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/60 transition-colors">
                    <PlayCircleIcon className="h-16 w-16 text-white" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽 컨텐츠 */}
          <div className="lg:col-span-2">
            {/* 탭 메뉴 */}
            <div className="bg-white rounded-xl shadow-soft mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button className="px-6 py-4 text-sm font-medium text-primary-600 border-b-2 border-primary-600">
                    강의소개
                  </button>
                  <button className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                    커리큘럼
                  </button>
                  <button className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                    리뷰
                  </button>
                  <Link
                    href={`/courses/${course.id}/qa`}
                    className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Q&A
                  </Link>
                </nav>
              </div>

              <div className="p-6">
                {/* 강의 소개 */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    강의 소개
                  </h2>
                  <div 
                    className="prose prose-gray max-w-none"
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />
                </section>

                {/* 이런 분들께 추천해요 */}
                {course.target_audience && course.target_audience.length > 0 && (
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      이런 분들께 추천해요
                    </h2>
                    <ul className="space-y-3">
                      {course.target_audience.map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <ShieldCheckIcon className="h-6 w-6 text-primary-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* 학습 내용 */}
                {course.learning_goals && course.learning_goals.length > 0 && (
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      학습 내용
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.learning_goals.map((goal: string, index: number) => (
                        <div key={index} className="flex items-start">
                          <DocumentTextIcon className="h-6 w-6 text-primary-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{goal}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 커리큘럼 */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    커리큘럼
                  </h2>
                  <div className="mb-4 text-sm text-gray-600">
                    총 {course.lessons?.length || 0}개 레슨 • {course.total_duration}분
                  </div>
                  <LessonList
                    courseId={course.id}
                    lessons={course.lessons || []}
                    isEnrolled={isEnrolled}
                    progress={lessonProgress}
                  />
                </section>
              </div>
            </div>
          </div>

          {/* 오른쪽 사이드바 */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              {/* 수강 신청 카드 */}
              <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
                <div className="mb-6">
                  <div className="flex items-baseline mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ₩{formatPrice(course.price)}
                    </span>
                    {course.original_price && course.original_price > course.price && (
                      <>
                        <span className="text-lg text-gray-400 line-through ml-2">
                          ₩{formatPrice(course.original_price)}
                        </span>
                        <span className="text-sm text-red-500 ml-2">
                          {Math.round((1 - course.price / course.original_price) * 100)}% 할인
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {isEnrolled ? (
                  <>
                    <Link
                      href={`/courses/${course.id}/lesson/${course.lessons?.[0]?.id}`}
                      className="btn-primary w-full justify-center mb-3"
                    >
                      학습 계속하기
                    </Link>
                    <div className="text-center text-sm text-gray-600">
                      진도율: {enrollment.progress?.toFixed(1) || 0}%
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href={user ? `/payment/${course.id}?userId=${user.id}` : `/auth/login?returnUrl=/payment/${course.id}`}
                      className="btn-primary w-full justify-center mb-3"
                    >
                      수강 신청하기
                    </Link>
                    <AddToCartButton
                      courseId={course.id}
                      courseName={course.title}
                      variant="outline"
                      size="lg"
                      className="w-full"
                      requireAuth={true}
                    />
                  </>
                )}

                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <span>평생 무제한 수강</span>
                  </div>
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    <span>수료증 발급</span>
                  </div>
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 mr-2" />
                    <span>30일 환불 보장</span>
                  </div>
                </div>
              </div>

              {/* 강사 정보 카드 */}
              <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">강사 소개</h3>
                <div className="flex items-start mb-4">
                  <Image
                    src={course.instructor?.user?.avatar || '/default-avatar.svg'}
                    alt={course.instructor?.user?.name}
                    width={64}
                    height={64}
                    className="rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {course.instructor?.user?.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      경력 {course.instructor?.experience_years}년
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm mb-4">
                  {course.instructor?.bio}
                </p>
                <Link
                  href={`/instructor/${course.instructor_id}`}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  강사 프로필 보기 →
                </Link>
              </div>

              {/* 다른 강의 추천 */}
              {otherCourses && otherCourses.length > 0 && (
                <div className="bg-white rounded-xl shadow-soft p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    같은 강사의 다른 강의
                  </h3>
                  <div className="space-y-4">
                    {otherCourses.map((otherCourse) => (
                      <Link
                        key={otherCourse.id}
                        href={`/courses/${otherCourse.id}`}
                        className="block hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                      >
                        <div className="flex items-start">
                          <Image
                            src={otherCourse.thumbnail || '/default-course.svg'}
                            alt={otherCourse.title}
                            width={80}
                            height={60}
                            className="rounded object-cover mr-3"
                          />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                              {otherCourse.title}
                            </h4>
                            <p className="text-sm text-primary-600 mt-1">
                              ₩{formatPrice(otherCourse.price)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}