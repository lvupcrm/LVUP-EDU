import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { VideoPlayer } from '@/components/video/VideoPlayer'
import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface PageProps {
  params: {
    id: string
    lessonId: string
  }
}

export default async function LessonPage({ params }: PageProps) {
  // 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-8">강의를 시청하려면 로그인해주세요.</p>
          <Link href="/auth/login" className="btn-primary">
            로그인하기
          </Link>
        </div>
      </div>
    )
  }

  // 수강 상태 확인
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', user.id)
    .eq('course_id', params.id)
    .single()

  if (!enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">수강 권한이 없습니다</h2>
          <p className="text-gray-600 mb-8">이 강의를 수강하려면 먼저 신청해주세요.</p>
          <Link href={`/courses/${params.id}`} className="btn-primary">
            강의 상세 보기
          </Link>
        </div>
      </div>
    )
  }

  // 레슨 정보 가져오기
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select(`
      *,
      course:courses(
        id,
        title,
        instructor_id
      )
    `)
    .eq('id', params.lessonId)
    .single()

  if (lessonError || !lesson) {
    notFound()
  }

  // 전체 레슨 목록 가져오기
  const { data: allLessons } = await supabase
    .from('lessons')
    .select('id, title, order_num, duration')
    .eq('course_id', params.id)
    .order('order_num')

  // 진도 정보 가져오기
  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('enrollment_id', enrollment.id)
    .eq('lesson_id', params.lessonId)
    .single()

  // 이전/다음 레슨 찾기
  const currentIndex = allLessons?.findIndex(l => l.id === params.lessonId) ?? -1
  const prevLesson = currentIndex > 0 ? allLessons![currentIndex - 1] : null
  const nextLesson = currentIndex < (allLessons?.length ?? 0) - 1 ? allLessons![currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2">
            {/* 레슨 헤더 */}
            <div className="mb-6">
              <Link
                href={`/courses/${params.id}`}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                {lesson.course?.title}로 돌아가기
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {lesson.title}
              </h1>
              {lesson.description && (
                <p className="text-gray-600">{lesson.description}</p>
              )}
            </div>

            {/* 비디오 플레이어 */}
            <div className="bg-white rounded-xl shadow-soft overflow-hidden mb-8">
              <VideoPlayer
                videoUrl={lesson.video_url || ''}
                videoId={lesson.video_id}
                provider={lesson.video_provider || 'direct'}
                thumbnail={lesson.video_thumbnail}
                initialPosition={progress?.last_position || 0}
                onProgress={async (seconds, percentage) => {
                  // 진도 업데이트 (5초마다)
                  if (seconds % 5 === 0) {
                    await supabase
                      .from('lesson_progress')
                      .upsert({
                        enrollment_id: enrollment.id,
                        lesson_id: params.lessonId,
                        watched_seconds: seconds,
                        total_seconds: lesson.video_duration || lesson.duration * 60,
                        progress_percentage: percentage,
                        last_position: seconds,
                        status: percentage >= 90 ? 'COMPLETED' : 'IN_PROGRESS'
                      })
                  }
                }}
                onComplete={async () => {
                  // 완료 처리
                  await supabase
                    .from('lesson_progress')
                    .upsert({
                      enrollment_id: enrollment.id,
                      lesson_id: params.lessonId,
                      status: 'COMPLETED',
                      completed_at: new Date().toISOString(),
                      completion_count: (progress?.completion_count || 0) + 1
                    })
                }}
              />
            </div>

            {/* 레슨 콘텐츠 */}
            {lesson.content && (
              <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">레슨 내용</h2>
                <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }} />
              </div>
            )}

            {/* 학습 자료 */}
            {lesson.resources && lesson.resources.length > 0 && (
              <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">학습 자료</h2>
                <ul className="space-y-2">
                  {lesson.resources.map((resource: any, index: number) => (
                    <li key={index}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 underline"
                      >
                        {resource.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 이전/다음 레슨 네비게이션 */}
            <div className="flex justify-between">
              {prevLesson ? (
                <Link
                  href={`/courses/${params.id}/lesson/${prevLesson.id}`}
                  className="btn-outline"
                >
                  <ChevronLeftIcon className="h-4 w-4 mr-2" />
                  이전 레슨
                </Link>
              ) : (
                <div />
              )}
              
              {nextLesson ? (
                <Link
                  href={`/courses/${params.id}/lesson/${nextLesson.id}`}
                  className="btn-primary"
                >
                  다음 레슨
                  <ChevronRightIcon className="h-4 w-4 ml-2" />
                </Link>
              ) : (
                <Link
                  href={`/courses/${params.id}`}
                  className="btn-primary"
                >
                  강의 완료
                  <CheckCircleIcon className="h-4 w-4 ml-2" />
                </Link>
              )}
            </div>
          </div>

          {/* 사이드바 - 레슨 목록 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-soft p-6 sticky top-20">
              <h3 className="text-lg font-bold text-gray-900 mb-4">강의 목차</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {allLessons?.map((l, index) => {
                  const isActive = l.id === params.lessonId
                  const isCompleted = false // TODO: 진도 정보 추가
                  
                  return (
                    <Link
                      key={l.id}
                      href={`/courses/${params.id}/lesson/${l.id}`}
                      className={`block p-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-3">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="text-sm">{l.title}</div>
                          {l.duration && (
                            <div className="text-xs text-gray-500 mt-1">
                              {l.duration}분
                            </div>
                          )}
                        </div>
                        {isCompleted && (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}