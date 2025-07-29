'use client'

import Link from 'next/link'
import { 
  UsersIcon, 
  AcademicCapIcon, 
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  StarIcon,
  DocumentCheckIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'

interface AdminDashboardProps {
  stats: any
  recentOrders: any[]
  recentEnrollments: any[]
  popularCourses: any[]
}

export default function AdminDashboard({
  stats,
  recentOrders,
  recentEnrollments,
  popularCourses
}: AdminDashboardProps) {
  // 통계 카드 데이터
  const statCards = [
    {
      title: '총 사용자',
      value: stats.total_users || 0,
      subtext: `이번 주 +${stats.new_users_week || 0}`,
      icon: UsersIcon,
      color: 'bg-blue-500',
      link: '/admin/users'
    },
    {
      title: '총 코스',
      value: stats.total_courses || 0,
      subtext: '공개된 코스',
      icon: AcademicCapIcon,
      color: 'bg-green-500',
      link: '/admin/courses'
    },
    {
      title: '총 매출',
      value: `₩${(stats.total_revenue || 0).toLocaleString()}`,
      subtext: `이번 달 ₩${(stats.revenue_month || 0).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
      link: '/admin/orders'
    },
    {
      title: '총 수강 등록',
      value: stats.total_enrollments || 0,
      subtext: `이번 주 +${stats.new_enrollments_week || 0}`,
      icon: ShoppingCartIcon,
      color: 'bg-purple-500',
      link: '/admin/enrollments'
    }
  ]

  const additionalStats = [
    {
      label: '총 강사',
      value: stats.total_instructors || 0,
      icon: UsersIcon
    },
    {
      label: '총 리뷰',
      value: stats.total_reviews || 0,
      icon: StarIcon
    },
    {
      label: '평균 평점',
      value: (stats.average_rating || 0).toFixed(1),
      icon: ChartBarIcon
    },
    {
      label: '발급 수료증',
      value: stats.total_certificates || 0,
      icon: DocumentCheckIcon
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="text-gray-600 mt-2">플랫폼 현황을 한눈에 확인하세요</p>
        </div>

        {/* 주요 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Link
              key={stat.title}
              href={stat.link}
              className="bg-white rounded-xl shadow-soft p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} bg-opacity-20 p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.subtext}</p>
            </Link>
          ))}
        </div>

        {/* 추가 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {additionalStats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow-soft p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 최근 주문 */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">최근 주문</h2>
              <Link href="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700">
                전체보기 →
              </Link>
            </div>
            
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{order.user?.name || '익명'}</p>
                      <p className="text-sm text-gray-600">
                        {order.order_items?.map((item: any) => item.course?.title).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₩{order.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">최근 주문이 없습니다</p>
            )}
          </div>

          {/* 최근 수강 등록 */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">최근 수강 등록</h2>
              <Link href="/admin/enrollments" className="text-sm text-primary-600 hover:text-primary-700">
                전체보기 →
              </Link>
            </div>
            
            {recentEnrollments.length > 0 ? (
              <div className="space-y-3">
                {recentEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{enrollment.user?.name || '익명'}</p>
                      <p className="text-sm text-gray-600">{enrollment.course?.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {enrollment.progress.toFixed(0)}% 완료
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(enrollment.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">최근 등록이 없습니다</p>
            )}
          </div>
        </div>

        {/* 인기 코스 */}
        <div className="bg-white rounded-xl shadow-soft p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">인기 코스</h2>
            <Link href="/admin/courses" className="text-sm text-primary-600 hover:text-primary-700">
              전체보기 →
            </Link>
          </div>
          
          {popularCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularCourses.map((course) => (
                <div key={course.id} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{course.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{course.enrollments?.length || 0} 수강생</span>
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                      <span>{course.average_rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">코스가 없습니다</p>
          )}
        </div>

        {/* 빠른 링크 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Link href="/admin/users" className="btn-outline text-center">
            사용자 관리
          </Link>
          <Link href="/admin/courses" className="btn-outline text-center">
            코스 관리
          </Link>
          <Link href="/admin/orders" className="btn-outline text-center">
            주문 관리
          </Link>
          <Link href="/admin/instructors" className="btn-outline text-center">
            강사 관리
          </Link>
        </div>
      </div>
    </div>
  )
}