'use client'

import Link from 'next/link'
import { StarIcon } from '@heroicons/react/24/solid'

interface Course {
  id: string
  title: string
  price: number
  status: string
  category: string
  thumbnail?: string
  created_at: string
  instructor?: {
    user: {
      name: string
    }
  }
  enrollments?: { count: number }[]
  average_rating?: number
}

interface CourseTableProps {
  courses: Course[]
}

export default function CourseTable({ courses }: CourseTableProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      TRAINER: '트레이너 교육',
      OPERATOR: '운영자 교육',
      NUTRITION: '영양 관리',
      BUSINESS: '비즈니스'
    }
    return labels[category] || category
  }

  const getStatusBadge = (status: string) => {
    if (status === 'PUBLISHED') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          공개됨
        </span>
      )
    } else {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
          임시저장
        </span>
      )
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                코스
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                강사
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                수강생
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                평점
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                가격
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {course.thumbnail ? (
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={course.thumbnail}
                          alt={course.title}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-200" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {course.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(course.created_at)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {course.instructor?.user.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getCategoryLabel(course.category)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                  {course.enrollments?.[0]?.count || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {course.average_rating ? (
                    <div className="flex items-center justify-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-900">
                        {course.average_rating.toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                  ₩{course.price.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getStatusBadge(course.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="text-primary-600 hover:text-primary-900 mr-4"
                  >
                    상세보기
                  </Link>
                  <Link
                    href={`/instructor/courses/${course.id}/edit`}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    수정
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}