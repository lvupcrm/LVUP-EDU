'use client'

import Link from 'next/link'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'

interface ReviewStatsProps {
  averageRating: number
  totalReviews: number
  ratingStats: {
    rating: number
    count: number
    percentage: number
  }[]
  currentFilter?: string
  courseId: string
}

export default function ReviewStats({
  averageRating,
  totalReviews,
  ratingStats,
  currentFilter,
  courseId
}: ReviewStatsProps) {
  const renderStars = (rating: number, size: string = 'h-5 w-5') => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} className={`${size} text-yellow-400`} />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarOutlineIcon className={`${size} text-yellow-400`} />
            <StarIcon className={`${size} text-yellow-400 absolute inset-0 clip-half`} />
          </div>
        )
      } else {
        stars.push(<StarOutlineIcon key={i} className={`${size} text-gray-300`} />)
      }
    }
    return stars
  }

  return (
    <div className="bg-white rounded-xl shadow-soft p-6 sticky top-20">
      {/* 평균 평점 */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {averageRating.toFixed(1)}
        </div>
        <div className="flex justify-center mb-2">
          {renderStars(averageRating)}
        </div>
        <p className="text-sm text-gray-600">
          {totalReviews}개의 수강평
        </p>
      </div>

      {/* 평점별 분포 */}
      <div className="space-y-3">
        {ratingStats.map((stat) => (
          <Link
            key={stat.rating}
            href={
              currentFilter === stat.rating.toString()
                ? `/courses/${courseId}/reviews`
                : `/courses/${courseId}/reviews?filter=${stat.rating}`
            }
            className={`block ${
              currentFilter === stat.rating.toString()
                ? 'bg-primary-50'
                : 'hover:bg-gray-50'
            } rounded-lg p-2 transition-colors`}
          >
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 w-8">
                {stat.rating}점
              </span>
              <div className="flex-1 mx-3">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">
                {stat.count}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {currentFilter && (
        <Link
          href={`/courses/${courseId}/reviews`}
          className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-4"
        >
          전체 리뷰 보기
        </Link>
      )}

      {/* 추가 스타일 */}
      <style jsx>{`
        .clip-half {
          clip-path: inset(0 50% 0 0);
        }
      `}</style>
    </div>
  )
}