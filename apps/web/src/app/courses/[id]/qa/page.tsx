import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  LockClosedIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

interface PageProps {
  params: {
    id: string
  }
  searchParams: {
    filter?: 'all' | 'resolved' | 'unresolved' | 'my'
    sort?: 'latest' | 'popular' | 'unanswered'
  }
}

export default async function CourseQAPage({ params, searchParams }: PageProps) {
  const filter = searchParams.filter || 'all'
  const sort = searchParams.sort || 'latest'

  // 코스 정보 가져오기
  const { data: course } = await supabase
    .from('courses')
    .select('id, title')
    .eq('id', params.id)
    .single()

  if (!course) {
    notFound()
  }

  // 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser()

  // 수강 상태 확인
  let isEnrolled = false
  if (user) {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', params.id)
      .single()
    
    isEnrolled = !!enrollment
  }

  // Q&A 목록 가져오기
  let query = supabase
    .from('questions')
    .select(`
      *,
      user:users(id, name, avatar),
      lesson:lessons(id, title),
      answers(count)
    `)
    .eq('course_id', params.id)

  // 필터 적용
  if (filter === 'resolved') {
    query = query.eq('is_resolved', true)
  } else if (filter === 'unresolved') {
    query = query.eq('is_resolved', false)
  } else if (filter === 'my' && user) {
    query = query.eq('user_id', user.id)
  }

  // 정렬 적용
  if (sort === 'latest') {
    query = query.order('created_at', { ascending: false })
  } else if (sort === 'popular') {
    query = query.order('view_count', { ascending: false })
  } else if (sort === 'unanswered') {
    query = query.eq('answer_count', 0).order('created_at', { ascending: false })
  }

  const { data: questions } = await query

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
              <h1 className="text-3xl font-bold text-gray-900">Q&A</h1>
              <p className="text-gray-600 mt-2">
                강의에 대한 질문과 답변을 나누는 공간입니다
              </p>
            </div>
            
            {isEnrolled && (
              <Link
                href={`/courses/${params.id}/qa/new`}
                className="btn-primary"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                질문하기
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 필터 사이드바 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="font-medium text-gray-900 mb-4">필터</h3>
              
              <div className="space-y-2">
                <Link
                  href={`/courses/${params.id}/qa?filter=all&sort=${sort}`}
                  className={`block px-4 py-2 rounded-lg text-sm ${
                    filter === 'all'
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  전체 질문
                </Link>
                <Link
                  href={`/courses/${params.id}/qa?filter=unresolved&sort=${sort}`}
                  className={`block px-4 py-2 rounded-lg text-sm ${
                    filter === 'unresolved'
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  미해결 질문
                </Link>
                <Link
                  href={`/courses/${params.id}/qa?filter=resolved&sort=${sort}`}
                  className={`block px-4 py-2 rounded-lg text-sm ${
                    filter === 'resolved'
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  해결된 질문
                </Link>
                {user && (
                  <Link
                    href={`/courses/${params.id}/qa?filter=my&sort=${sort}`}
                    className={`block px-4 py-2 rounded-lg text-sm ${
                      filter === 'my'
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    내 질문
                  </Link>
                )}
              </div>

              <hr className="my-6" />

              <h3 className="font-medium text-gray-900 mb-4">정렬</h3>
              <div className="space-y-2">
                <Link
                  href={`/courses/${params.id}/qa?filter=${filter}&sort=latest`}
                  className={`block px-4 py-2 rounded-lg text-sm ${
                    sort === 'latest'
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  최신순
                </Link>
                <Link
                  href={`/courses/${params.id}/qa?filter=${filter}&sort=popular`}
                  className={`block px-4 py-2 rounded-lg text-sm ${
                    sort === 'popular'
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  인기순
                </Link>
                <Link
                  href={`/courses/${params.id}/qa?filter=${filter}&sort=unanswered`}
                  className={`block px-4 py-2 rounded-lg text-sm ${
                    sort === 'unanswered'
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  답변 없음
                </Link>
              </div>
            </div>
          </div>

          {/* Q&A 목록 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-soft">
              {questions && questions.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {questions.map((question) => (
                    <Link
                      key={question.id}
                      href={`/courses/${params.id}/qa/${question.id}`}
                      className="block p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {question.is_resolved && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                해결됨
                              </span>
                            )}
                            {question.is_private && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <LockClosedIcon className="h-3 w-3 mr-1" />
                                비공개
                              </span>
                            )}
                            {question.is_pinned && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                📌 고정됨
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {question.title}
                          </h3>
                          
                          {question.lesson && (
                            <p className="text-sm text-gray-600 mb-2">
                              레슨: {question.lesson.title}
                            </p>
                          )}
                          
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span className="flex items-center">
                              <img
                                src={question.user?.avatar || '/default-avatar.svg'}
                                alt={question.user?.name}
                                className="h-5 w-5 rounded-full mr-1"
                              />
                              {question.user?.name}
                            </span>
                            <span>
                              {new Date(question.created_at).toLocaleDateString('ko-KR')}
                            </span>
                            <span className="flex items-center">
                              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                              {question.answer_count || 0}개 답변
                            </span>
                            <span className="flex items-center">
                              <EyeIcon className="h-4 w-4 mr-1" />
                              {question.view_count || 0}회 조회
                            </span>
                          </div>
                        </div>
                        
                        {question.answer_count > 0 && (
                          <div className="ml-4 text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              {question.answer_count}
                            </div>
                            <div className="text-xs text-gray-500">답변</div>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <QuestionMarkCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">아직 질문이 없습니다</p>
                  {isEnrolled && (
                    <Link
                      href={`/courses/${params.id}/qa/new`}
                      className="btn-primary"
                    >
                      첫 질문하기
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}