import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  UsersIcon, 
  BookOpenIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  AcademicCapIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline'

export default async function AdminDashboardPage() {
  // 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // 관리자 권한 확인
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
    redirect('/')
  }

  // 대시보드 통계 데이터 수집
  const [
    { count: totalUsers },
    { count: totalCourses },
    { count: totalEnrollments },
    { data: revenueData }
  ] = await Promise.all([
    // 총 사용자 수
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true }),
    
    // 총 강의 수
    supabase
      .from('courses')
      .select('*', { count: 'exact', head: true }),
    
    // 총 수강 등록 수
    supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true }),
    
    // 총 매출액
    supabase
      .from('orders')
      .select('amount')
      .eq('status', 'PAID')
  ])

  const totalRevenue = revenueData?.reduce((sum, order) => sum + order.amount, 0) || 0

  // 최근 활동 데이터
  const { data: recentUsers } = await supabase
    .from('users')
    .select('id, name, email, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      amount,
      status,
      created_at,
      user:users(name, email),
      course:courses(title)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // 주간 통계 (지난 7일)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const [
    { count: newUsersThisWeek },
    { count: newEnrollmentsThisWeek },
    { data: revenueThisWeek }
  ] = await Promise.all([
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString()),
    
    supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .gte('enrolled_at', weekAgo.toISOString()),
    
    supabase
      .from('orders')
      .select('amount')
      .eq('status', 'PAID')
      .gte('created_at', weekAgo.toISOString())
  ])

  const revenueThisWeekTotal = revenueThisWeek?.reduce((sum, order) => sum + order.amount, 0) || 0

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const statsCards = [
    {
      title: '총 사용자',
      value: totalUsers || 0,
      change: `+${newUsersThisWeek || 0} 이번 주`,
      icon: UsersIcon,
      color: 'bg-blue-500',
      changeType: 'positive' as const
    },
    {
      title: '총 강의',
      value: totalCourses || 0,
      change: '활성 강의',
      icon: BookOpenIcon,
      color: 'bg-green-500',
      changeType: 'neutral' as const
    },
    {
      title: '총 수강등록',
      value: totalEnrollments || 0,
      change: `+${newEnrollmentsThisWeek || 0} 이번 주`,
      icon: AcademicCapIcon,
      color: 'bg-purple-500',
      changeType: 'positive' as const
    },
    {
      title: '총 매출',
      value: `₩${formatPrice(totalRevenue)}`,
      change: `+₩${formatPrice(revenueThisWeekTotal)} 이번 주`,
      icon: CurrencyDollarIcon,
      color: 'bg-emerald-500',
      changeType: 'positive' as const
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 대시보드</h1>
          <p className="text-gray-600">LVUP EDU 플랫폼 운영 현황을 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm ${
                  stat.changeType === 'positive' 
                    ? 'text-green-600' 
                    : stat.changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 최근 가입 사용자 */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">최근 가입 사용자</h2>
              <Link href="/admin/users" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                전체 보기 →
              </Link>
            </div>
            
            {recentUsers && recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">
                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user.name || '이름 없음'}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">최근 가입한 사용자가 없습니다</p>
            )}
          </div>

          {/* 최근 주문 */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">최근 주문</h2>
              <Link href="/admin/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                전체 보기 →
              </Link>
            </div>
            
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{order.course?.title}</p>
                      <p className="text-sm text-gray-600">{order.user?.name || order.user?.email}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₩{formatPrice(order.amount)}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'PAID' 
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {order.status === 'PAID' ? '결제완료' : 
                         order.status === 'PENDING' ? '결제대기' : '취소/환불'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">최근 주문이 없습니다</p>
            )}
          </div>
        </div>

        {/* 관리 메뉴 */}
        <div className="mt-8 bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">관리 메뉴</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/admin/users"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <UsersIcon className="h-8 w-8 text-primary-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">사용자 관리</h3>
                <p className="text-sm text-gray-600">회원 정보 및 권한 관리</p>
              </div>
            </Link>

            <Link
              href="/admin/courses"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <BookOpenIcon className="h-8 w-8 text-primary-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">강의 관리</h3>
                <p className="text-sm text-gray-600">강의 등록 및 수정</p>
              </div>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <CurrencyDollarIcon className="h-8 w-8 text-primary-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">주문 관리</h3>
                <p className="text-sm text-gray-600">결제 및 환불 관리</p>
              </div>
            </Link>

            <Link
              href="/admin/instructors"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <AcademicCapIcon className="h-8 w-8 text-primary-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">강사 관리</h3>
                <p className="text-sm text-gray-600">강사진 정보 관리</p>
              </div>
            </Link>

            <Link
              href="/admin/analytics"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <ChartBarIcon className="h-8 w-8 text-primary-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">통계 분석</h3>
                <p className="text-sm text-gray-600">상세 통계 및 리포트</p>
              </div>
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <ShieldCheckIcon className="h-8 w-8 text-primary-600 mr-4" />
              <div>
                <h3 className="font-medium text-gray-900">시스템 설정</h3>
                <p className="text-sm text-gray-600">플랫폼 설정 관리</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}