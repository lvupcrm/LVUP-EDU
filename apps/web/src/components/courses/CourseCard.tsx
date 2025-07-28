'use client'

import Link from 'next/link'
import Image from 'next/image'
import { StarIcon, ClockIcon, UserGroupIcon, PlayIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string
    thumbnail?: string
    price: number
    is_free: boolean
    level: string
    enrollment_count: number
    average_rating: number
    review_count?: number
    duration?: number
    instructor: {
      user: {
        name: string
        avatar?: string
      }
    }
  }
}

export default function CourseCard({ course }: CourseCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}시간 ${mins > 0 ? `${mins}분` : ''}`
    }
    return `${mins}분`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case '초급':
        return 'bg-green-100 text-green-800'
      case '중급':
        return 'bg-yellow-100 text-yellow-800'
      case '고급':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }


  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon key={`full-${i}`} className="h-4 w-4 text-yellow-400" />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <StarIcon key="half" className="h-4 w-4 text-yellow-400" />
      )
    }

    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarOutlineIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      )
    }

    return stars
  }

  return (
    <Link href={`/courses/${course.id}`} className="group">
      <div className="bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-medium transition-all duration-300 group-hover:-translate-y-1">
        {/* Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-primary-100 to-fitness-100 overflow-hidden">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayIcon className="w-16 h-16 text-primary-400" />
            </div>
          )}
          
          {/* Course Type Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              !course.is_free 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {!course.is_free ? '유료' : '무료'}
            </span>
          </div>

        </div>

        {/* Content */}
        <div className="p-6">
          {/* Level */}
          <div className="mb-3">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>
              {course.level}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {course.description}
          </p>

          {/* Instructor */}
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-fitness-500 rounded-full flex items-center justify-center mr-3">
              {course.instructor.user.avatar ? (
                <Image
                  src={course.instructor.user.avatar}
                  alt={course.instructor.user.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <span className="text-white text-sm font-medium">
                  {course.instructor.user.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {course.instructor.user.name}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              {course.duration && (
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {formatDuration(course.duration)}
                </div>
              )}
              <div className="flex items-center">
                <UserGroupIcon className="h-4 w-4 mr-1" />
                {course.enrollment_count}명
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center mr-2">
                {renderStars(course.average_rating)}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {course.average_rating.toFixed(1)}
              </span>
              {course.review_count !== undefined && (
                <span className="text-sm text-gray-500 ml-1">
                  ({course.review_count})
                </span>
              )}
            </div>

            {/* Price */}
            <div className="text-right">
              {!course.is_free ? (
                <div>
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(course.price)}원
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-green-600">
                  무료
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}