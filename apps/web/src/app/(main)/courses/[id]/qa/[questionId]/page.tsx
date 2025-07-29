import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AnswerSection from '@/components/qa/AnswerSection'
import QuestionActions from '@/components/qa/QuestionActions'
import {
  CheckCircleIcon,
  LockClosedIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface PageProps {
  params: {
    id: string
    questionId: string
  }
}

export default async function QuestionDetailPage({ params }: PageProps) {
  // 질문 정보 가져오기
  const { data: question, error } = await supabase
    .from('questions')
    .select(`
      *,
      user:users(id, name, avatar),
      lesson:lessons(id, title),
      course:courses(id, title, instructor_id)
    `)
    .eq('id', params.questionId)
    .single()

  if (error || !question) {
    notFound()
  }

  // 조회수 증가
  await supabase
    .from('questions')
    .update({ view_count: (question.view_count || 0) + 1 })
    .eq('id', params.questionId)

  // 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser()

  // 수강 상태 확인
  let isEnrolled = false
  let isInstructor = false
  
  if (user) {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', params.id)
      .single()
    
    isEnrolled = !!enrollment

    // 강사인지 확인
    const { data: instructorProfile } = await supabase
      .from('instructor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('id', question.course?.instructor_id)
      .single()
    
    isInstructor = !!instructorProfile
  }

  // 답변 목록 가져오기
  const { data: answers } = await supabase
    .from('answers')
    .select(`
      *,
      user:users(id, name, avatar),
      answer_votes(user_id)
    `)
    .eq('question_id', params.questionId)
    .order('is_accepted', { ascending: false })
    .order('vote_count', { ascending: false })
    .order('created_at')

  const isAuthor = user?.id === question.user_id
  const canViewPrivate = isAuthor || isInstructor

  // 비공개 질문인데 권한이 없는 경우
  if (question.is_private && !canViewPrivate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LockClosedIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">비공개 질문입니다</h2>
          <p className="text-gray-600">이 질문은 작성자와 강사만 볼 수 있습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="mb-6">
            <Link
              href={`/courses/${params.id}/qa`}
              className="text-gray-600 hover:text-gray-900 text-sm inline-block mb-4"
            >
              ← Q&A로 돌아가기
            </Link>

            {/* 질문 제목 */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
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

                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {question.title}
                  </h1>

                  {question.lesson && (
                    <p className="text-sm text-gray-600 mb-4">
                      관련 레슨: {question.lesson.title}
                    </p>
                  )}
                </div>

                {(isAuthor || isInstructor) && (
                  <QuestionActions
                    questionId={question.id}
                    courseId={params.id}
                    isResolved={question.is_resolved}
                    isPinned={question.is_pinned}
                    isAuthor={isAuthor}
                    isInstructor={isInstructor}
                  />
                )}
              </div>

              {/* 작성자 정보 */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <img
                      src={question.user?.avatar || '/default-avatar.svg'}
                      alt={question.user?.name}
                      className="h-8 w-8 rounded-full mr-2"
                    />
                    <span className="font-medium text-gray-700">
                      {question.user?.name}
                    </span>
                  </div>
                  <span className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {new Date(question.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4">
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

              {/* 질문 내용 */}
              <div className="prose prose-gray max-w-none">
                <div className="whitespace-pre-wrap">{question.content}</div>
              </div>
            </div>
          </div>

          {/* 답변 섹션 */}
          <AnswerSection
            questionId={params.questionId}
            answers={answers || []}
            isEnrolled={isEnrolled}
            isInstructor={isInstructor}
            currentUser={user}
            questionAuthorId={question.user_id}
          />
        </div>
      </div>
    </div>
  )
}