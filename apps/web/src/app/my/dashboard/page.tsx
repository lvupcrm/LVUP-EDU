import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  BookOpenIcon, 
  ClockIcon, 
  TrophyIcon, 
  ChartBarIcon,
  PlayIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline'

export default async function DashboardPage() {
  // 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // 사용자 프로필 정보
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // 수강 중인 강의 목록
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      *,
      course:courses(
        id,
        title,
        thumbnail,
        total_duration,
        instructor:instructor_profiles(
          user:users(name)
        )
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'ACTIVE')
    .order('enrolled_at', { ascending: false })

  // 진도 정보 계산
  const enrollmentsWithProgress = await Promise.all(
    (enrollments || []).map(async (enrollment) => {
      // 전체 레슨 수
      const { count: totalLessons } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', enrollment.course_id)

      // 완료한 레슨 수
      const { count: completedLessons } = await supabase
        .from('lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('enrollment_id', enrollment.id)
        .eq('status', 'COMPLETED')

      const progressPercentage = totalLessons ? Math.round((completedLessons || 0) / totalLessons * 100) : 0

      return {
        ...enrollment,
        totalLessons: totalLessons || 0,
        completedLessons: completedLessons || 0,
        progressPercentage
      }
    })
  )

  // 최근 수강한 레슨
  const { data: recentProgress } = await supabase
    .from('lesson_progress')
    .select(`
      *,
      lesson:lessons(
        id,
        title,
        course_id,
        course:courses(title, thumbnail)
      )
    `)
    .eq('enrollment_id', enrollments?.[0]?.id)
    .order('updated_at', { ascending: false })
    .limit(5)

  // 통계 데이터
  const totalEnrollments = enrollments?.length || 0
  const completedCourses = enrollmentsWithProgress.filter(e => e.progressPercentage >= 100).length
  const totalWatchTime = enrollmentsWithProgress.reduce((acc, e) => acc + (e.course?.total_duration || 0), 0)
  const averageProgress = enrollmentsWithProgress.length > 0 
    ? Math.round(enrollmentsWithProgress.reduce((acc, e) => acc + e.progressPercentage, 0) / enrollmentsWithProgress.length)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            안녕하세요, {profile?.name || user.email}님! 👋
          </h1>
          <p className="text-gray-600">
            오늘도 한 단계 더 성장해보세요
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <BookOpenIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">수강 중인 강의</p>
                <p className="text-2xl font-bold text-gray-900">{totalEnrollments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrophyIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">완료한 강의</p>
                <p className="text-2xl font-bold text-gray-900">{completedCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">총 학습 시간</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(totalWatchTime / 60)}시간</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center">
              <div className="p-3 bg-fitness-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-fitness-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">평균 진도율</p>
                <p className="text-2xl font-bold text-gray-900">{averageProgress}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 수강 중인 강의 */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">수강 중인 강의</h2>
              <Link href="/my/courses" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                전체 보기 →
              </Link>
            </div>

            {enrollmentsWithProgress.length > 0 ? (
              <div className="space-y-4">
                {enrollmentsWithProgress.slice(0, 3).map((enrollment) => (
                  <div key={enrollment.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Image
                      src={enrollment.course?.thumbnail || '/default-course.svg'}
                      alt={enrollment.course?.title || ''}
                      width={80}
                      height={60}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {enrollment.course?.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {enrollment.course?.instructor?.user?.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>진도율</span>
                            <span>{enrollment.progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${enrollment.progressPercentage}%` }}
                            />
                          </div>
                        </div>
                        <Link
                          href={`/courses/${enrollment.course_id}`}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <PlayIcon className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">아직 수강 중인 강의가 없습니다</p>
                <Link href="/courses" className="btn-primary">
                  강의 둘러보기
                </Link>
              </div>
            )}
          </div>

          {/* 최근 학습 활동 */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">최근 학습 활동</h2>

            {recentProgress && recentProgress.length > 0 ? (
              <div className="space-y-4">
                {recentProgress.map((progress) => (
                  <div key={progress.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`p-2 rounded-full ${
                      progress.status === 'COMPLETED' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {progress.status === 'COMPLETED' ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <PlayIcon className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {progress.lesson?.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {progress.lesson?.course?.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(progress.updated_at).toLocaleDateString('ko-KR')}
                        {progress.status === 'COMPLETED' ? ' • 완료' : ` • ${Math.round(progress.progress_percentage || 0)}% 진행`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">아직 학습 기록이 없습니다</p>
              </div>
            )}
          </div>
        </div>

        {/* 추천 강의 섹션 */}
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-fitness-50 rounded-xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              다음 단계로 나아갈 준비가 되셨나요? 🚀
            </h2>
            <p className="text-gray-600 mb-6">
              전문가가 추천하는 맞춤형 강의로 한층 더 성장해보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses" className="btn-primary">
                추천 강의 보기
              </Link>
              <Link href="/instructors" className="btn-outline">
                전문 강사진 만나기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}