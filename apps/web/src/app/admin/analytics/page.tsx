import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import {
  ChartBarIcon,
  UsersIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  StarIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

export default async function AdminAnalyticsPage() {
  // 현재 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 관리자 권한 확인
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
    redirect('/');
  }

  // 기본 통계 데이터 수집
  const [
    { count: totalUsers },
    { count: totalCourses },
    { count: totalInstructors },
    { count: totalEnrollments },
    { data: revenueData },
    { data: users },
    { data: enrollments },
    { data: courses },
    { data: reviews },
  ] = await Promise.all([
    // 총 사용자 수
    supabase.from('users').select('*', { count: 'exact', head: true }),

    // 총 강의 수
    supabase.from('courses').select('*', { count: 'exact', head: true }),

    // 총 강사 수
    supabase
      .from('instructor_profiles')
      .select('*', { count: 'exact', head: true }),

    // 총 수강 등록 수
    supabase.from('enrollments').select('*', { count: 'exact', head: true }),

    // 매출 데이터
    supabase.from('orders').select('amount, created_at').eq('status', 'PAID'),

    // 사용자 가입 데이터
    supabase
      .from('users')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1000),

    // 수강 등록 데이터
    supabase
      .from('enrollments')
      .select('enrolled_at, course_id')
      .order('enrolled_at', { ascending: false })
      .limit(1000),

    // 강의 데이터
    supabase
      .from('courses')
      .select('id, title, price, enrollment_count, average_rating, created_at'),

    // 리뷰 데이터
    supabase
      .from('reviews')
      .select('rating, created_at')
      .order('created_at', { ascending: false })
      .limit(500),
  ]);

  // 날짜별 통계 계산
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const recentUsers =
    users?.filter(u => new Date(u.created_at) >= thirtyDaysAgo).length || 0;
  const recentEnrollments =
    enrollments?.filter(e => new Date(e.enrolled_at) >= thirtyDaysAgo).length ||
    0;
  const weeklyUsers =
    users?.filter(u => new Date(u.created_at) >= sevenDaysAgo).length || 0;

  const totalRevenue =
    revenueData?.reduce((sum, order) => sum + order.amount, 0) || 0;
  const monthlyRevenue =
    revenueData
      ?.filter(order => new Date(order.created_at) >= thirtyDaysAgo)
      .reduce((sum, order) => sum + order.amount, 0) || 0;

  // 월별 가입자 추이
  const monthlySignups =
    users?.reduce(
      (acc, user) => {
        const month = new Date(user.created_at).toISOString().slice(0, 7);
        if (!acc[month]) acc[month] = 0;
        acc[month]++;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  // 월별 매출 추이
  const monthlyRevenueData =
    revenueData?.reduce(
      (acc, order) => {
        const month = new Date(order.created_at).toISOString().slice(0, 7);
        if (!acc[month]) acc[month] = 0;
        acc[month] += order.amount;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  // 인기 강의 Top 5
  const topCourses =
    courses
      ?.sort((a, b) => (b.enrollment_count || 0) - (a.enrollment_count || 0))
      .slice(0, 5) || [];

  // 평균 평점
  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  // 성장률 계산 (가상 데이터 - 실제로는 이전 달 데이터와 비교)
  const userGrowth = 12.5; // %
  const revenueGrowth = 8.3; // %
  const enrollmentGrowth = 15.2; // %

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* 헤더 */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>플랫폼 통계 분석</h1>
          <p className='text-gray-600 mt-2'>
            LVUP EDU 플랫폼의 전체 성과와 지표를 확인하세요
          </p>
        </div>

        {/* 핵심 지표 */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center'>
                <UsersIcon className='h-6 w-6 text-primary-600' />
              </div>
              <div className='flex items-center text-sm text-green-600'>
                <ArrowTrendingUpIcon className='h-4 w-4 mr-1' />
                <span>+{userGrowth}%</span>
              </div>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              {totalUsers || 0}
            </div>
            <p className='text-sm text-gray-600 mt-1'>전체 회원</p>
            <p className='text-xs text-gray-500'>이번 달 +{recentUsers}명</p>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                <CurrencyDollarIcon className='h-6 w-6 text-green-600' />
              </div>
              <div className='flex items-center text-sm text-green-600'>
                <ArrowTrendingUpIcon className='h-4 w-4 mr-1' />
                <span>+{revenueGrowth}%</span>
              </div>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              ₩{formatPrice(totalRevenue)}
            </div>
            <p className='text-sm text-gray-600 mt-1'>총 매출</p>
            <p className='text-xs text-gray-500'>
              이번 달 ₩{formatPrice(monthlyRevenue)}
            </p>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-fitness-100 rounded-lg flex items-center justify-center'>
                <AcademicCapIcon className='h-6 w-6 text-fitness-600' />
              </div>
              <div className='flex items-center text-sm text-green-600'>
                <ArrowTrendingUpIcon className='h-4 w-4 mr-1' />
                <span>+{enrollmentGrowth}%</span>
              </div>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              {totalEnrollments || 0}
            </div>
            <p className='text-sm text-gray-600 mt-1'>총 수강등록</p>
            <p className='text-xs text-gray-500'>
              이번 달 +{recentEnrollments}건
            </p>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center'>
                <StarIcon className='h-6 w-6 text-yellow-600' />
              </div>
              <span className='text-sm text-gray-500'>평균</span>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              {averageRating.toFixed(1)}
            </div>
            <p className='text-sm text-gray-600 mt-1'>플랫폼 평점</p>
            <p className='text-xs text-gray-500'>
              {reviews?.length || 0}개 리뷰
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* 월별 가입자 추이 */}
          <div className='bg-white rounded-xl shadow-soft p-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-6'>
              월별 가입자 추이
            </h2>

            <div className='space-y-4'>
              {Object.entries(monthlySignups)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .slice(-6)
                .map(([month, count]) => {
                  const maxCount = Math.max(...Object.values(monthlySignups));
                  const percentage =
                    maxCount > 0 ? (count / maxCount) * 100 : 0;

                  return (
                    <div key={month} className='flex items-center'>
                      <div className='w-20 text-sm text-gray-600'>
                        {new Date(month + '-01').toLocaleDateString('ko-KR', {
                          month: 'short',
                          year: '2-digit',
                        })}
                      </div>
                      <div className='flex-1 mx-4'>
                        <div className='w-full bg-gray-200 rounded-full h-6'>
                          <div
                            className='bg-primary-600 h-6 rounded-full flex items-center justify-end pr-2'
                            style={{ width: `${percentage}%` }}
                          >
                            <span className='text-xs text-white font-medium'>
                              {count}명
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* 월별 매출 추이 */}
          <div className='bg-white rounded-xl shadow-soft p-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-6'>
              월별 매출 추이
            </h2>

            <div className='space-y-4'>
              {Object.entries(monthlyRevenueData)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .slice(-6)
                .map(([month, revenue]) => {
                  const maxRevenue = Math.max(
                    ...Object.values(monthlyRevenueData)
                  );
                  const percentage =
                    maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;

                  return (
                    <div key={month} className='flex items-center'>
                      <div className='w-20 text-sm text-gray-600'>
                        {new Date(month + '-01').toLocaleDateString('ko-KR', {
                          month: 'short',
                          year: '2-digit',
                        })}
                      </div>
                      <div className='flex-1 mx-4'>
                        <div className='w-full bg-gray-200 rounded-full h-6'>
                          <div
                            className='bg-green-600 h-6 rounded-full flex items-center justify-end pr-2'
                            style={{ width: `${percentage}%` }}
                          >
                            <span className='text-xs text-white font-medium'>
                              ₩{formatPrice(revenue)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* 인기 강의 Top 5 */}
          <div className='lg:col-span-2 bg-white rounded-xl shadow-soft p-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-6'>
              인기 강의 Top 5
            </h2>

            <div className='space-y-4'>
              {topCourses.map((course, index) => (
                <div
                  key={course.id}
                  className='flex items-center p-4 bg-gray-50 rounded-lg'
                >
                  <div className='w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-4'>
                    {index + 1}
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-medium text-gray-900'>
                      {course.title}
                    </h3>
                    <div className='flex items-center mt-1 text-sm text-gray-600'>
                      <UsersIcon className='h-4 w-4 mr-1' />
                      <span className='mr-4'>
                        {course.enrollment_count || 0}명
                      </span>
                      <StarIcon className='h-4 w-4 mr-1 text-yellow-400' />
                      <span className='mr-4'>
                        {course.average_rating?.toFixed(1) || '0.0'}
                      </span>
                      <CurrencyDollarIcon className='h-4 w-4 mr-1' />
                      <span>₩{formatPrice(course.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 플랫폼 성과 요약 */}
          <div className='space-y-6'>
            {/* 플랫폼 개요 */}
            <div className='bg-white rounded-xl shadow-soft p-6'>
              <h3 className='text-lg font-bold text-gray-900 mb-4'>
                플랫폼 개요
              </h3>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>총 강의</span>
                  <span className='font-medium'>{totalCourses || 0}개</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>활성 강사</span>
                  <span className='font-medium'>{totalInstructors || 0}명</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>이번 주 신규 회원</span>
                  <span className='font-medium text-green-600'>
                    +{weeklyUsers}명
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>평균 강의 가격</span>
                  <span className='font-medium'>
                    ₩
                    {formatPrice(
                      courses && courses.length > 0
                        ? Math.round(
                            courses.reduce((sum, c) => sum + c.price, 0) /
                              courses.length
                          )
                        : 0
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* 성장 지표 */}
            <div className='bg-gradient-to-r from-primary-50 to-fitness-50 rounded-xl p-6'>
              <h3 className='text-lg font-bold text-gray-900 mb-4'>
                성장 지표
              </h3>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-700'>사용자 증가율</span>
                  <div className='flex items-center text-green-600'>
                    <ArrowTrendingUpIcon className='h-4 w-4 mr-1' />
                    <span className='font-medium'>+{userGrowth}%</span>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-700'>매출 증가율</span>
                  <div className='flex items-center text-green-600'>
                    <ArrowTrendingUpIcon className='h-4 w-4 mr-1' />
                    <span className='font-medium'>+{revenueGrowth}%</span>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-700'>수강 등록 증가율</span>
                  <div className='flex items-center text-green-600'>
                    <ArrowTrendingUpIcon className='h-4 w-4 mr-1' />
                    <span className='font-medium'>+{enrollmentGrowth}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 추천 액션 */}
            <div className='bg-yellow-50 rounded-xl p-6'>
              <h3 className='text-lg font-bold text-yellow-900 mb-4'>
                💡 추천 액션
              </h3>
              <div className='space-y-2 text-sm text-yellow-800'>
                <p>• 인기 강의 카테고리에 더 많은 강사 영입</p>
                <p>• 신규 회원 온보딩 프로세스 개선</p>
                <p>• 평점이 낮은 강의들의 품질 향상 지원</p>
                <p>• 모바일 사용자 경험 최적화</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
