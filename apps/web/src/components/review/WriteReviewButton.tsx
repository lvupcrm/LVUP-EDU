'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PencilSquareIcon } from '@heroicons/react/24/outline'

interface WriteReviewButtonProps {
  courseId: string
  canWrite: boolean
  enrollmentProgress: number
  hasExistingReview: boolean
  existingReviewId?: string
}

export default function WriteReviewButton({
  courseId,
  canWrite,
  enrollmentProgress,
  hasExistingReview,
  existingReviewId
}: WriteReviewButtonProps) {
  const router = useRouter()

  if (hasExistingReview && existingReviewId) {
    return (
      <Link
        href={`/courses/${courseId}/reviews/${existingReviewId}/edit`}
        className="btn-outline"
      >
        <PencilSquareIcon className="h-5 w-5 mr-2" />
        내 리뷰 수정
      </Link>
    )
  }

  if (!canWrite) {
    return (
      <div className="text-right">
        <button
          disabled
          className="btn-primary opacity-50 cursor-not-allowed"
          title={enrollmentProgress < 20 ? '20% 이상 수강 후 작성 가능' : '이미 리뷰를 작성하셨습니다'}
        >
          <PencilSquareIcon className="h-5 w-5 mr-2" />
          리뷰 작성
        </button>
        {enrollmentProgress < 20 && (
          <p className="text-xs text-gray-500 mt-1">
            20% 이상 수강 후 작성 가능 (현재 {enrollmentProgress.toFixed(1)}%)
          </p>
        )}
      </div>
    )
  }

  return (
    <Link
      href={`/courses/${courseId}/reviews/new`}
      className="btn-primary"
    >
      <PencilSquareIcon className="h-5 w-5 mr-2" />
      리뷰 작성
    </Link>
  )
}