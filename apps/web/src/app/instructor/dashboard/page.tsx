import { supabase } from '@/lib/supabase'
import { checkInstructorAuth } from '@/middleware/instructor'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  AcademicCapIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlayCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

export default async function InstructorDashboard() {
  const auth = await checkInstructorAuth()
  
  if (!auth.authorized) {
    redirect(auth.redirect!)
  }

  // 강사의 강의 통계 가져오기
  const { data: courses } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      price,
      enrollment_count,
      average_rating,
      review_count,
      status,
      lessons(count)
    `)
    .eq('instructor_id', auth.instructorId)

  // 총 수강생 수 계산
  const totalStudents = courses?.reduce((sum, course) => sum + (course.enrollment_count || 0), 0) || 0
  
  // 총 수익 계산 (간단한 계산, 실제로는 enrollments 테이블 참조 필요)
  const totalRevenue = courses?.reduce((sum, course) => 
    sum + (course.price * (course.enrollment_count || 0)), 0
  ) || 0

  // 평균 평점 계산
  const averageRating = courses && courses.length > 0
    ? courses.reduce((sum, course) => sum + (course.average_rating || 0), 0) / courses.length
    : 0

  // 최근 수강 신청 가져오기
  const { data: recentEnrollments } = await supabase
    .from('enrollments')
    .select(`
      id,
      enrolled_at,
      user:users(name, email),
      course:courses(title)
    `)
    .in('course_id', courses?.map(c => c.id) || [])
    .order('enrolled_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">강사 대시보드</h1>
          <p className="text-gray-600 mt-2">강의 관리 및 통계를 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="h-6 w-6 text-primary-600" />
              </div>
              <span className="text-sm text-gray-500">전체</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {courses?.length || 0}개
            </div>
            <p className="text-sm text-gray-600 mt-1">개설 강의</p>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-fitness-100 rounded-lg flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-fitness-600" />
              </div>
              <span className="text-sm text-gray-500">누적</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalStudents.toLocaleString()}명
            </div>
            <p className="text-sm text-gray-600 mt-1">수강생</p>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">예상</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ₩{totalRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 mt-1">총 수익</p>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-500">평균</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {averageRating.toFixed(1)}점
            </div>
            <p className="text-sm text-gray-600 mt-1">평점</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 강의 목록 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-soft">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">내 강의</h2>
                  <Link
                    href="/instructor/courses/new"
                    className="btn-primary text-sm"
                  >
                    새 강의 만들기
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {courses && courses.length > 0 ? (
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <Link
                              href={`/instructor/courses/${course.id}`}
                              className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                            >
                              {course.title}
                            </Link>
                            <div className="flex items-center mt-1 text-sm text-gray-600 space-x-4">
                              <span className="flex items-center">
                                <PlayCircleIcon className="h-4 w-4 mr-1" />
                                {course.lessons?.[0]?.count || 0}개 레슨
                              </span>
                              <span className="flex items-center">
                                <UsersIcon className="h-4 w-4 mr-1" />
                                {course.enrollment_count || 0}명
                              </span>
                              <span className="flex items-center">
                                <ChartBarIcon className="h-4 w-4 mr-1" />
                                {course.average_rating?.toFixed(1) || '0.0'}점
                              </span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            course.status === 'PUBLISHED' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {course.status === 'PUBLISHED' ? '공개중' : '비공개'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-primary-600">
                            ₩{course.price.toLocaleString()}
                          </span>
                          <Link
                            href={`/instructor/courses/${course.id}/edit`}
                            className="text-sm text-gray-600 hover:text-primary-600"
                          >
                            관리하기 →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AcademicCapIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">아직 개설한 강의가 없습니다</p>
                    <Link
                      href="/instructor/courses/new"
                      className="btn-primary"
                    >
                      첫 강의 만들기
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 최근 수강 신청 */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">최근 수강 신청</h3>
              
              {recentEnrollments && recentEnrollments.length > 0 ? (
                <div className="space-y-3">
                  {recentEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="text-sm">
                      <div className="font-medium text-gray-900">
                        {(enrollment as any).user?.name}
                      </div>
                      <div className="text-gray-600">
                        {(enrollment as any).course?.title}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        {new Date((enrollment as any).enrolled_at).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">아직 수강 신청이 없습니다</p>
              )}
            </div>

            {/* 빠른 링크 */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">빠른 링크</h3>
              <div className="space-y-3">
                <Link
                  href="/instructor/courses/new"
                  className="flex items-center text-gray-700 hover:text-primary-600"
                >
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm">새 강의 만들기</span>
                </Link>
                <Link
                  href="/instructor/students"
                  className="flex items-center text-gray-700 hover:text-primary-600"
                >
                  <UsersIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm">수강생 관리</span>
                </Link>
                <Link
                  href="/instructor/revenue"
                  className="flex items-center text-gray-700 hover:text-primary-600"
                >
                  <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm">수익 정산</span>
                </Link>
                <Link
                  href="/instructor/analytics"
                  className="flex items-center text-gray-700 hover:text-primary-600"
                >
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm">통계 분석</span>
                </Link>
              </div>
            </div>

            {/* 도움말 */}
            <div className="bg-primary-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-primary-900 mb-2">
                강의 제작 팁
              </h3>
              <p className="text-sm text-primary-700 mb-4">
                고품질 강의를 만들기 위한 가이드를 확인해보세요.
              </p>
              <Link
                href="/instructor/guide"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                가이드 보기 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}