'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  CheckCircleIcon,
  HandThumbUpIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  HandThumbUpIcon as HandThumbUpSolidIcon
} from '@heroicons/react/24/solid'

interface Answer {
  id: string
  content: string
  is_accepted: boolean
  is_instructor_answer: boolean
  vote_count: number
  created_at: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  answer_votes: { user_id: string }[]
}

interface AnswerSectionProps {
  questionId: string
  answers: Answer[]
  isEnrolled: boolean
  isInstructor: boolean
  currentUser: any
  questionAuthorId: string
}

export default function AnswerSection({
  questionId,
  answers,
  isEnrolled,
  isInstructor,
  currentUser,
  questionAuthorId
}: AnswerSectionProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [newAnswer, setNewAnswer] = useState('')
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newAnswer.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('answers')
        .insert({
          question_id: questionId,
          user_id: currentUser.id,
          content: newAnswer,
          is_instructor_answer: isInstructor
        })

      if (error) throw error

      setNewAnswer('')
      router.refresh()
    } catch (error) {
      console.error('Error creating answer:', error)
      alert('답변 등록 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (answerId: string, hasVoted: boolean) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      if (hasVoted) {
        // 투표 취소
        await supabase
          .from('answer_votes')
          .delete()
          .eq('answer_id', answerId)
          .eq('user_id', currentUser.id)
      } else {
        // 투표 추가
        await supabase
          .from('answer_votes')
          .insert({
            answer_id: answerId,
            user_id: currentUser.id
          })
      }

      router.refresh()
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handleAcceptAnswer = async (answerId: string) => {
    setLoading(true)
    try {
      // 먼저 모든 답변의 accepted 상태를 false로
      await supabase
        .from('answers')
        .update({ is_accepted: false })
        .eq('question_id', questionId)

      // 선택한 답변을 accepted로
      await supabase
        .from('answers')
        .update({ is_accepted: true })
        .eq('id', answerId)

      // 질문도 해결됨으로 표시
      await supabase
        .from('questions')
        .update({ is_resolved: true })
        .eq('id', questionId)

      router.refresh()
    } catch (error) {
      console.error('Error accepting answer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditAnswer = async (answerId: string) => {
    if (!editContent.trim()) return

    setLoading(true)
    try {
      await supabase
        .from('answers')
        .update({ 
          content: editContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', answerId)

      setEditingAnswerId(null)
      setEditContent('')
      router.refresh()
    } catch (error) {
      console.error('Error updating answer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm('정말 이 답변을 삭제하시겠습니까?')) return

    setLoading(true)
    try {
      await supabase
        .from('answers')
        .delete()
        .eq('id', answerId)

      router.refresh()
    } catch (error) {
      console.error('Error deleting answer:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 답변 목록 */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {answers.length}개의 답변
        </h2>

        <div className="space-y-4">
          {answers.map((answer) => {
            const hasVoted = answer.answer_votes?.some(
              vote => vote.user_id === currentUser?.id
            )
            const isAuthor = currentUser?.id === answer.user.id
            const canAccept = currentUser?.id === questionAuthorId

            return (
              <div
                key={answer.id}
                className={`bg-white rounded-xl shadow-soft p-6 ${
                  answer.is_accepted ? 'ring-2 ring-green-500' : ''
                }`}
              >
                {/* 답변 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={answer.user.avatar || '/default-avatar.svg'}
                      alt={answer.user.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {answer.user.name}
                        </span>
                        {answer.is_instructor_answer && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                            강사
                          </span>
                        )}
                        {answer.is_accepted && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            채택됨
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(answer.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* 투표 버튼 */}
                    <button
                      onClick={() => handleVote(answer.id, hasVoted)}
                      disabled={!currentUser || isAuthor}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                        hasVoted
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {hasVoted ? (
                        <HandThumbUpSolidIcon className="h-4 w-4" />
                      ) : (
                        <HandThumbUpIcon className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">
                        {answer.vote_count || 0}
                      </span>
                    </button>

                    {/* 채택 버튼 */}
                    {canAccept && !answer.is_accepted && (
                      <button
                        onClick={() => handleAcceptAnswer(answer.id)}
                        disabled={loading}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">채택</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 답변 내용 */}
                {editingAnswerId === answer.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="input min-h-[150px]"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingAnswerId(null)
                          setEditContent('')
                        }}
                        className="btn-outline text-sm"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => handleEditAnswer(answer.id)}
                        disabled={loading}
                        className="btn-primary text-sm"
                      >
                        수정 완료
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-gray max-w-none">
                    <div className="whitespace-pre-wrap">{answer.content}</div>
                  </div>
                )}

                {/* 답변 액션 */}
                {isAuthor && editingAnswerId !== answer.id && (
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => {
                        setEditingAnswerId(answer.id)
                        setEditContent(answer.content)
                      }}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteAnswer(answer.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 답변 작성 폼 */}
      {(isEnrolled || isInstructor) && currentUser && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">답변 작성</h3>
          
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              className="input min-h-[200px] mb-4"
              placeholder="답변을 작성해주세요..."
              required
            />
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {isInstructor && (
                  <span className="text-primary-600 font-medium">
                    강사로 답변합니다
                  </span>
                )}
              </p>
              
              <button
                type="submit"
                disabled={loading || !newAnswer.trim()}
                className="btn-primary"
              >
                {loading ? '등록 중...' : '답변 등록'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 로그인 안내 */}
      {!currentUser && (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <UserCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">답변을 작성하려면 로그인이 필요합니다</p>
          <a href="/auth/login" className="btn-primary">
            로그인하기
          </a>
        </div>
      )}
    </div>
  )
}