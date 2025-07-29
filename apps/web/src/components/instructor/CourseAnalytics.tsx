'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  UsersIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline'

interface CourseAnalyticsProps {
  courseId: string
}

interface Analytics {
  totalStudents: number
  completedStudents: number
  averageProgress: number
  totalWatchHours: number
  averageRating: number
  reviewCount: number
  recentEnrollments: any[]
  lessonStats: any[]
}

export default function CourseAnalytics({ courseId }: CourseAnalyticsProps) {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalStudents: 0,
    completedStudents: 0,
    averageProgress: 0,
    totalWatchHours: 0,
    averageRating: 0,
    reviewCount: 0,
    recentEnrollments: [],
    lessonStats: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [courseId])

  const fetchAnalytics = async () => {
    try {
      // 수강생 통계
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*, user:users(name, email)')
        .eq('course_id', courseId)

      // 레슨별 통계
      const { data: lessons } = await supabase
        .from('lessons')
        .select(`
          id,
          title,
          duration,
          lesson_progress(
            status,
            watched_seconds,
            completed_at
          )
        `)
        .eq('course_id', courseId)
        .order('order_num')

      // 리뷰 통계 (현재는 임시)
      const { data: course } = await supabase
        .from('courses')
        .select('average_rating, review_count')
        .eq('id', courseId)
        .single()

      if (enrollments) {
        const completed = enrollments.filter(e => e.status === 'COMPLETED').length
        const avgProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length

        setAnalytics({
          totalStudents: enrollments.length,
          completedStudents: completed,
          averageProgress: avgProgress || 0,
          totalWatchHours: 0, // TODO: Calculate from lesson_progress
          averageRating: course?.average_rating || 0,
          reviewCount: course?.review_count || 0,
          recentEnrollments: enrollments.slice(0, 5),
          lessonStats: lessons || []
        })
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <UsersIcon className="h-8 w-8 text-primary-600" />
            <span className="text-sm text-gray-500">전체</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {analytics.totalStudents}명
          </div>
          <p className="text-sm text-gray-600 mt-1">수강생</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <span className="text-sm text-gray-500">완료</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {analytics.completedStudents}명
          </div>
          <p className="text-sm text-gray-600 mt-1">수료생</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <ChartBarIcon className="h-8 w-8 text-fitness-600" />
            <span className="text-sm text-gray-500">평균</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {analytics.averageProgress.toFixed(1)}%
          </div>
          <p className="text-sm text-gray-600 mt-1">진도율</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <StarIcon className="h-8 w-8 text-yellow-500" />
            <span className="text-sm text-gray-500">{analytics.reviewCount}개</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {analytics.averageRating.toFixed(1)}점
          </div>
          <p className="text-sm text-gray-600 mt-1">평점</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 레슨별 통계 */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">레슨별 완료율</h3>
          <div className="space-y-3">
            {analytics.lessonStats.map((lesson, index) => {
              const completedCount = lesson.lesson_progress?.filter(
                (p: any) => p.status === 'COMPLETED'
              ).length || 0
              const completionRate = analytics.totalStudents > 0
                ? (completedCount / analytics.totalStudents) * 100
                : 0

              return (
                <div key={lesson.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {index + 1}. {lesson.title}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {lesson.duration}분
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {completionRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 최근 수강생 */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">최근 수강생</h3>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    진도율
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.recentEnrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {enrollment.user?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {enrollment.user?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3 max-w-[100px]">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{ width: `${enrollment.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-700">
                          {enrollment.progress?.toFixed(1) || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(enrollment.enrolled_at).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}