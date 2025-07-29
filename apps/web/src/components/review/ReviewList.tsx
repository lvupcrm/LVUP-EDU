'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { StarIcon } from '@heroicons/react/24/solid'
import { HandThumbUpIcon, CheckBadgeIcon } from '@heroicons/react/24/outline'
import { HandThumbUpIcon as HandThumbUpSolidIcon } from '@heroicons/react/24/solid'

interface Review {
  id: string
  rating: number
  title?: string
  content: string
  would_recommend: boolean
  difficulty_rating?: number
  helpful_count: number
  is_verified: boolean
  created_at: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  review_helpful: { user_id: string }[]
}

interface ReviewListProps {
  reviews: Review[]
  currentUser: any
  courseId: string
  currentSort: string
}

export default function ReviewList({
  reviews,
  currentUser,
  courseId,
  currentSort
}: ReviewListProps) {
  const router = useRouter()
  const [expandedReviews, setExpandedReviews] = useState<string[]>([])

  const handleHelpful = async (reviewId: string, isHelpful: boolean) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      if (isHelpful) {
        await supabase
          .from('review_helpful')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', currentUser.id)
      } else {
        await supabase
          .from('review_helpful')
          .insert({
            review_id: reviewId,
            user_id: currentUser.id
          })
      }

      router.refresh()
    } catch (error) {
      console.error('Error marking helpful:', error)
    }
  }

  const toggleExpand = (reviewId: string) => {
    setExpandedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    )
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getDifficultyLabel = (rating?: number) => {
    if (!rating) return null
    const labels = ['매우 쉬움', '쉬움', '적당함', '어려움', '매우 어려움']
    return labels[rating - 1]
  }

  return (
    <div className="bg-white rounded-xl shadow-soft">
      {/* 정렬 옵션 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {reviews.length}개의 수강평
          </h3>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">정렬:</span>
            <select
              value={currentSort}
              onChange={(e) => router.push(`/courses/${courseId}/reviews?sort=${e.target.value}`)}
              className="text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="latest">최신순</option>
              <option value="helpful">도움순</option>
              <option value="rating_high">평점 높은순</option>
              <option value="rating_low">평점 낮은순</option>
            </select>
          </div>
        </div>
      </div>

      {/* 리뷰 목록 */}
      {reviews.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {reviews.map((review) => {
            const isExpanded = expandedReviews.includes(review.id)
            const isLongContent = review.content.length > 300
            const isHelpful = review.review_helpful?.some(
              h => h.user_id === currentUser?.id
            )

            return (
              <div key={review.id} className="p-6">
                {/* 리뷰 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="flex mr-2">
                        {renderStars(review.rating)}
                      </div>
                      <span className="font-medium text-gray-900">
                        {review.rating}.0
                      </span>
                      {review.is_verified && (
                        <span className="ml-2 inline-flex items-center text-xs text-green-600">
                          <CheckBadgeIcon className="h-4 w-4 mr-1" />
                          수강 완료
                        </span>
                      )}
                    </div>
                    
                    {review.title && (
                      <h4 className="font-medium text-gray-900 mb-1">
                        {review.title}
                      </h4>
                    )}
                  </div>

                  <div className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>

                {/* 리뷰 내용 */}
                <div className="mb-4">
                  <p className={`text-gray-700 ${
                    !isExpanded && isLongContent ? 'line-clamp-4' : ''
                  }`}>
                    {review.content}
                  </p>
                  
                  {isLongContent && (
                    <button
                      onClick={() => toggleExpand(review.id)}
                      className="text-sm text-primary-600 hover:text-primary-700 mt-2"
                    >
                      {isExpanded ? '접기' : '더보기'}
                    </button>
                  )}
                </div>

                {/* 추가 정보 */}
                <div className="flex items-center text-sm text-gray-600 space-x-4 mb-4">
                  {review.would_recommend && (
                    <span className="text-green-600 font-medium">
                      ✓ 추천해요
                    </span>
                  )}
                  {review.difficulty_rating && (
                    <span>
                      난이도: {getDifficultyLabel(review.difficulty_rating)}
                    </span>
                  )}
                </div>

                {/* 하단 정보 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={review.user.avatar || '/default-avatar.svg'}
                      alt={review.user.name}
                      className="h-8 w-8 rounded-full mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      {review.user.name}
                    </span>
                  </div>

                  <button
                    onClick={() => handleHelpful(review.id, isHelpful)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                      isHelpful
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isHelpful ? (
                      <HandThumbUpSolidIcon className="h-4 w-4" />
                    ) : (
                      <HandThumbUpIcon className="h-4 w-4" />
                    )}
                    <span>도움이 됐어요 {review.helpful_count > 0 && `(${review.helpful_count})`}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-12 text-center">
          <StarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">아직 수강평이 없습니다</p>
        </div>
      )}
    </div>
  )
}