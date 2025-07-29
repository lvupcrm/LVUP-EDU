'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline'

interface QuestionActionsProps {
  questionId: string
  courseId: string
  isResolved: boolean
  isPinned: boolean
  isAuthor: boolean
  isInstructor: boolean
}

export default function QuestionActions({
  questionId,
  courseId,
  isResolved,
  isPinned,
  isAuthor,
  isInstructor
}: QuestionActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleToggleResolved = async () => {
    setLoading(true)
    try {
      await supabase
        .from('questions')
        .update({ is_resolved: !isResolved })
        .eq('id', questionId)

      router.refresh()
    } catch (error) {
      console.error('Error updating question:', error)
    } finally {
      setLoading(false)
      setShowMenu(false)
    }
  }

  const handleTogglePinned = async () => {
    setLoading(true)
    try {
      await supabase
        .from('questions')
        .update({ is_pinned: !isPinned })
        .eq('id', questionId)

      router.refresh()
    } catch (error) {
      console.error('Error updating question:', error)
    } finally {
      setLoading(false)
      setShowMenu(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 이 질문을 삭제하시겠습니까? 모든 답변도 함께 삭제됩니다.')) {
      return
    }

    setLoading(true)
    try {
      await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)

      router.push(`/courses/${courseId}/qa`)
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('질문 삭제 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
      >
        <EllipsisVerticalIcon className="h-5 w-5" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              {(isAuthor || isInstructor) && (
                <button
                  onClick={handleToggleResolved}
                  disabled={loading}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  {isResolved ? (
                    <>
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      미해결로 변경
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      해결됨으로 표시
                    </>
                  )}
                </button>
              )}

              {isInstructor && (
                <button
                  onClick={handleTogglePinned}
                  disabled={loading}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <BookmarkIcon className="h-4 w-4 mr-2" />
                  {isPinned ? '고정 해제' : '상단 고정'}
                </button>
              )}

              {isAuthor && (
                <>
                  <hr className="my-1" />
                  <button
                    onClick={() => router.push(`/courses/${courseId}/qa/${questionId}/edit`)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}