import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  MagnifyingGlassIcon,
  AcademicCapIcon,
  BookOpenIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ClockIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

export default async function AdminInstructorsPage() {
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

  // 강사 목록 가져오기
  const { data: instructors } = await supabase
    .from('instructor_profiles')
    .select(
      `
      id,
      bio,
      expertise,
      years_of_experience,
      is_verified,
      created_at,
      user:users(
        id,
        name,
        email,
        avatar,
        phone,
        created_at
      )
    `
    )
    .order('created_at', { ascending: false });

  // 각 강사의 통계 데이터 가져오기
  const instructorsWithStats = await Promise.all(
    (instructors || []).map(async instructor => {
      // 강의 수
      const { count: courseCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('instructor_id', instructor.id);

      // 강의 데이터
      const { data: courses } = await supabase
        .from('courses')
        .select(
          `
          id,
          price,
          enrollment_count,
          average_rating,
          review_count
        `
        )
        .eq('instructor_id', instructor.id);

      // 통계 계산
      const totalStudents =
        courses?.reduce(
          (sum, course) => sum + (course.enrollment_count || 0),
          0
        ) || 0;
      const totalRevenue =
        courses?.reduce(
          (sum, course) => sum + course.price * (course.enrollment_count || 0),
          0
        ) || 0;
      const averageRating =
        courses && courses.length > 0 && courses.some(c => c.average_rating)
          ? courses.reduce(
              (sum, course) => sum + (course.average_rating || 0),
              0
            ) / courses.filter(c => c.average_rating).length
          : 0;
      const totalReviews =
        courses?.reduce((sum, course) => sum + (course.review_count || 0), 0) ||
        0;

      return {
        ...instructor,
        courseCount: courseCount || 0,
        totalStudents,
        totalRevenue,
        averageRating,
        totalReviews,
      };
    })
  );

  // 전체 통계
  const stats = {
    total: instructors?.length || 0,
    verified: instructors?.filter(i => i.is_verified).length || 0,
    active: instructorsWithStats.filter(i => i.courseCount > 0).length,
    totalRevenue: instructorsWithStats.reduce(
      (sum, i) => sum + i.totalRevenue,
      0
    ),
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* 헤더 */}
        <div className='mb-8 flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>강사 관리</h1>
            <p className='text-gray-600 mt-2'>
              플랫폼의 강사진을 관리하고 승인하세요
            </p>
          </div>
          <button className='btn-primary'>강사 초대하기</button>
        </div>

        {/* 통계 카드 */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center'>
                <AcademicCapIcon className='h-6 w-6 text-primary-600' />
              </div>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              {stats.total}명
            </div>
            <p className='text-sm text-gray-600 mt-1'>전체 강사</p>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                <CheckBadgeIcon className='h-6 w-6 text-green-600' />
              </div>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              {stats.verified}명
            </div>
            <p className='text-sm text-gray-600 mt-1'>인증 강사</p>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-fitness-100 rounded-lg flex items-center justify-center'>
                <BookOpenIcon className='h-6 w-6 text-fitness-600' />
              </div>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              {stats.active}명
            </div>
            <p className='text-sm text-gray-600 mt-1'>활성 강사</p>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center'>
                <CurrencyDollarIcon className='h-6 w-6 text-yellow-600' />
              </div>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              ₩{formatPrice(stats.totalRevenue)}
            </div>
            <p className='text-sm text-gray-600 mt-1'>총 매출 창출</p>
          </div>
        </div>

        {/* 검색 필터 */}
        <div className='bg-white rounded-xl shadow-soft p-6 mb-6'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1 relative'>
              <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
              <input
                type='text'
                placeholder='이름, 이메일, 전문 분야로 검색...'
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              />
            </div>
            <select className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'>
              <option value=''>모든 상태</option>
              <option value='verified'>인증됨</option>
              <option value='pending'>대기중</option>
              <option value='active'>활성</option>
              <option value='inactive'>비활성</option>
            </select>
          </div>
        </div>

        {/* 강사 목록 테이블 */}
        <div className='bg-white rounded-xl shadow-soft overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    강사 정보
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    전문 분야
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    강의
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    수강생
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    평점
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    매출
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    상태
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {instructorsWithStats.map(instructor => (
                  <tr key={instructor.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='h-10 w-10 flex-shrink-0'>
                          {instructor.user?.avatar ? (
                            <Image
                              className='h-10 w-10 rounded-full'
                              src={instructor.user.avatar}
                              alt={instructor.user.name || ''}
                              width={40}
                              height={40}
                            />
                          ) : (
                            <div className='h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center'>
                              <span className='text-primary-600 font-medium'>
                                {(instructor.user?.name ||
                                  instructor.user?.email ||
                                  '?')[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>
                            {instructor.user?.name || '이름 없음'}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {instructor.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='text-sm text-gray-900'>
                        {instructor.expertise || '-'}
                      </div>
                      <div className='text-xs text-gray-500'>
                        경력 {instructor.years_of_experience || 0}년
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-gray-900'>
                        {instructor.courseCount}개
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>
                        {instructor.totalStudents}명
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <StarIcon className='h-4 w-4 text-yellow-400 mr-1' />
                        <span className='text-sm text-gray-900'>
                          {instructor.averageRating.toFixed(1)}
                        </span>
                        <span className='text-xs text-gray-500 ml-1'>
                          ({instructor.totalReviews})
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-gray-900'>
                        ₩{formatPrice(instructor.totalRevenue)}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {instructor.is_verified ? (
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                          <CheckBadgeIcon className='h-3 w-3 mr-1' />
                          인증됨
                        </span>
                      ) : (
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
                          <ClockIcon className='h-3 w-3 mr-1' />
                          대기중
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex space-x-2'>
                        <Link
                          href={`/admin/instructors/${instructor.id}`}
                          className='text-primary-600 hover:text-primary-900'
                        >
                          상세
                        </Link>
                        {!instructor.is_verified && (
                          <button className='text-green-600 hover:text-green-900'>
                            승인
                          </button>
                        )}
                        <button className='text-red-600 hover:text-red-900'>
                          정지
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!instructors || instructors.length === 0) && (
            <div className='text-center py-12'>
              <AcademicCapIcon className='h-12 w-12 text-gray-300 mx-auto mb-4' />
              <p className='text-gray-500'>아직 등록된 강사가 없습니다</p>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {instructors && instructors.length > 0 && (
          <div className='mt-6 flex items-center justify-between'>
            <div className='text-sm text-gray-700'>
              전체 <span className='font-medium'>{instructors.length}</span>명
              중{' '}
              <span className='font-medium'>
                1-{Math.min(instructors.length, 20)}
              </span>
              명 표시
            </div>
            <div className='flex space-x-2'>
              <button
                className='px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                disabled
              >
                이전
              </button>
              <button className='px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50'>
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
