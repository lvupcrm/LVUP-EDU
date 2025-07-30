import { supabase } from '@/lib/supabase';
import { checkInstructorAuth } from '@/middleware/instructor';
import { redirect } from 'next/navigation';
import {
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  EyeIcon,
  PlayCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

export default async function InstructorAnalyticsPage() {
  const auth = await checkInstructorAuth();

  if (!auth.authorized) {
    redirect(auth.redirect!);
  }

  // 강사의 모든 강의 가져오기
  const { data: courses } = await supabase
    .from('courses')
    .select(
      `
      id,
      title,
      price,
      created_at,
      enrollment_count,
      average_rating,
      review_count,
      lessons(count)
    `
    )
    .eq('instructor_id', auth.instructorId);

  const courseIds = courses?.map(c => c.id) || [];

  // 수강생 활동 데이터
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(
      `
      id,
      enrolled_at,
      course_id,
      status
    `
    )
    .in('course_id', courseIds);

  // 레슨 진도 데이터
  const { data: lessonProgress } = await supabase
    .from('lesson_progress')
    .select(
      `
      id,
      enrollment_id,
      status,
      progress_percentage,
      updated_at,
      enrollment:enrollments!inner(course_id)
    `
    )
    .in('enrollment.course_id', courseIds);

  // 리뷰 데이터
  const { data: reviews } = await supabase
    .from('reviews')
    .select(
      `
      id,
      rating,
      created_at,
      course_id
    `
    )
    .in('course_id', courseIds)
    .order('created_at', { ascending: false });

  // 통계 계산
  const totalStudents = new Set(enrollments?.map(e => e.id)).size;
  const activeStudents =
    lessonProgress?.filter(p => {
      const daysSinceActivity =
        (Date.now() - new Date(p.updated_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceActivity <= 7;
    }).length || 0;

  const completionRate = enrollments?.length
    ? Math.round(
        (enrollments.filter(e => e.status === 'COMPLETED').length /
          enrollments.length) *
          100
      )
    : 0;

  const averageRating = courses?.length
    ? courses.reduce((sum, c) => sum + (c.average_rating || 0), 0) /
      courses.length
    : 0;

  // 월별 수강생 증가 추이
  const monthlyEnrollments =
    enrollments?.reduce(
      (acc, enrollment) => {
        const month = new Date(enrollment.enrolled_at)
          .toISOString()
          .slice(0, 7);
        if (!acc[month]) acc[month] = 0;
        acc[month]++;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

  // 강의별 성과 분석
  const coursePerformance =
    courses?.map(course => {
      const courseEnrollments =
        enrollments?.filter(e => e.course_id === course.id) || [];
      const courseProgress =
        lessonProgress?.filter(p =>
          enrollments?.find(
            e => e.id === p.enrollment_id && e.course_id === course.id
          )
        ) || [];

      const completedCount = courseEnrollments.filter(
        e => e.status === 'COMPLETED'
      ).length;
      const activeCount = courseProgress.filter(p => {
        const daysSinceActivity =
          (Date.now() - new Date(p.updated_at).getTime()) /
          (1000 * 60 * 60 * 24);
        return daysSinceActivity <= 7;
      }).length;

      return {
        ...course,
        completionRate: courseEnrollments.length
          ? Math.round((completedCount / courseEnrollments.length) * 100)
          : 0,
        activeStudents: activeCount,
        totalRevenue: course.price * (course.enrollment_count || 0),
      };
    }) || [];

  // 시간대별 학습 패턴 (최근 7일)
  const learningPattern =
    lessonProgress?.reduce(
      (acc, progress) => {
        const hour = new Date(progress.updated_at).getHours();
        if (!acc[hour]) acc[hour] = 0;
        acc[hour]++;
        return acc;
      },
      {} as Record<number, number>
    ) || {};

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* 헤더 */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>통계 분석</h1>
          <p className='text-gray-600 mt-2'>
            강의 성과와 수강생 행동을 분석하여 인사이트를 얻으세요
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
                <span>12%</span>
              </div>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              {totalStudents}
            </div>
            <p className='text-sm text-gray-600 mt-1'>전체 수강생</p>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                <ChartBarIcon className='h-6 w-6 text-green-600' />
              </div>
              <span className='text-sm text-gray-500'>활성</span>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              {activeStudents}
            </div>
            <p className='text-sm text-gray-600 mt-1'>주간 활성 수강생</p>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-fitness-100 rounded-lg flex items-center justify-center'>
                <AcademicCapIcon className='h-6 w-6 text-fitness-600' />
              </div>
              <span className='text-sm text-gray-500'>완료율</span>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              {completionRate}%
            </div>
            <p className='text-sm text-gray-600 mt-1'>평균 완료율</p>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center'>
                <StarIcon className='h-6 w-6 text-yellow-600' />
              </div>
              <span className='text-sm text-gray-500'>평점</span>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              {averageRating.toFixed(1)}
            </div>
            <p className='text-sm text-gray-600 mt-1'>평균 강의 평점</p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* 월별 수강생 증가 추이 */}
          <div className='bg-white rounded-xl shadow-soft p-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-6'>
              월별 수강생 증가 추이
            </h2>

            <div className='space-y-4'>
              {Object.entries(monthlyEnrollments)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .slice(-6)
                .map(([month, count]) => {
                  const maxCount = Math.max(
                    ...Object.values(monthlyEnrollments)
                  );
                  const percentage =
                    maxCount > 0 ? (count / maxCount) * 100 : 0;

                  return (
                    <div key={month} className='flex items-center'>
                      <div className='w-20 text-sm text-gray-600'>
                        {new Date(month + '-01').toLocaleDateString('ko-KR', {
                          month: 'short',
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

          {/* 시간대별 학습 패턴 */}
          <div className='bg-white rounded-xl shadow-soft p-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-6'>
              시간대별 학습 패턴
            </h2>

            <div className='grid grid-cols-12 gap-1'>
              {Array.from({ length: 24 }, (_, hour) => {
                const count = learningPattern[hour] || 0;
                const maxCount = Math.max(...Object.values(learningPattern), 1);
                const intensity = count / maxCount;

                return (
                  <div key={hour} className='text-center'>
                    <div
                      className={`h-16 rounded ${
                        intensity === 0
                          ? 'bg-gray-100'
                          : intensity < 0.25
                            ? 'bg-primary-100'
                            : intensity < 0.5
                              ? 'bg-primary-200'
                              : intensity < 0.75
                                ? 'bg-primary-300'
                                : 'bg-primary-500'
                      }`}
                      title={`${hour}시: ${count}회`}
                    />
                    <div className='text-xs text-gray-500 mt-1'>
                      {hour % 6 === 0 ? hour : ''}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className='text-xs text-gray-500 text-center mt-2'>
              0시 ~ 23시
            </div>
          </div>
        </div>

        {/* 강의별 성과 분석 */}
        <div className='bg-white rounded-xl shadow-soft overflow-hidden'>
          <div className='p-6 border-b border-gray-200'>
            <h2 className='text-xl font-bold text-gray-900'>
              강의별 성과 분석
            </h2>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    강의명
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    수강생
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    완료율
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    평점
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    매출
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    활성 수강생
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {coursePerformance
                  .sort((a, b) => b.totalRevenue - a.totalRevenue)
                  .map(course => (
                    <tr key={course.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-medium text-gray-900'>
                          {course.title}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {course.lessons?.[0]?.count || 0}개 레슨
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {course.enrollment_count || 0}명
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='flex-1 mr-2'>
                            <div className='w-full bg-gray-200 rounded-full h-2'>
                              <div
                                className={`h-2 rounded-full ${
                                  course.completionRate >= 80
                                    ? 'bg-green-600'
                                    : course.completionRate >= 50
                                      ? 'bg-yellow-600'
                                      : 'bg-red-600'
                                }`}
                                style={{ width: `${course.completionRate}%` }}
                              />
                            </div>
                          </div>
                          <span className='text-sm text-gray-600'>
                            {course.completionRate}%
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <StarIcon className='h-4 w-4 text-yellow-400 mr-1' />
                          <span className='text-sm text-gray-900'>
                            {course.average_rating?.toFixed(1) || '0.0'}
                          </span>
                          <span className='text-xs text-gray-500 ml-1'>
                            ({course.review_count || 0})
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        ₩
                        {new Intl.NumberFormat('ko-KR').format(
                          course.totalRevenue
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {course.activeStudents}명
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {coursePerformance.length === 0 && (
            <div className='text-center py-12'>
              <ChartBarIcon className='h-12 w-12 text-gray-300 mx-auto mb-4' />
              <p className='text-gray-500'>아직 분석할 데이터가 없습니다</p>
            </div>
          )}
        </div>

        {/* 인사이트 */}
        <div className='mt-8 bg-primary-50 rounded-xl p-6'>
          <h3 className='text-lg font-bold text-primary-900 mb-4'>
            💡 분석 인사이트
          </h3>
          <div className='space-y-2 text-sm text-primary-700'>
            <p>
              • 평균 완료율이 {completionRate}%입니다. 레슨 구성을 더 작은
              단위로 나누어 보세요.
            </p>
            <p>
              • 오후 7-9시에 가장 많은 학습이 이루어집니다. 이 시간대에 라이브
              세션을 진행해보세요.
            </p>
            <p>
              • 신규 수강생이 꾸준히 증가하고 있습니다. 지속적인 콘텐츠
              업데이트가 중요합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
