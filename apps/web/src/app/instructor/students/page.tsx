import { supabase } from '@/lib/supabase';
import { checkInstructorAuth } from '@/middleware/instructor';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  UsersIcon,
  EnvelopeIcon,
  ChartBarIcon,
  CalendarIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

export default async function InstructorStudentsPage() {
  const auth = await checkInstructorAuth();

  if (!auth.authorized) {
    redirect(auth.redirect!);
  }

  // 강사의 모든 강의 가져오기
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title')
    .eq('instructor_id', auth.instructorId);

  const courseIds = courses?.map(c => c.id) || [];

  // 수강생 정보 가져오기
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(
      `
      id,
      enrolled_at,
      status,
      course_id,
      user:users(
        id,
        name,
        email,
        avatar,
        created_at
      ),
      course:courses(
        id,
        title,
        thumbnail
      )
    `
    )
    .in('course_id', courseIds)
    .order('enrolled_at', { ascending: false });

  // 수강생별 통계 계산
  const studentsWithStats = await Promise.all(
    (enrollments || []).map(async enrollment => {
      // 진도율 계산
      const { count: totalLessons } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', enrollment.course_id);

      const { count: completedLessons } = await supabase
        .from('lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('enrollment_id', enrollment.id)
        .eq('status', 'COMPLETED');

      const progressPercentage = totalLessons
        ? Math.round(((completedLessons || 0) / totalLessons) * 100)
        : 0;

      // 마지막 학습일
      const { data: lastProgress } = await supabase
        .from('lesson_progress')
        .select('updated_at')
        .eq('enrollment_id', enrollment.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      return {
        ...enrollment,
        progressPercentage,
        lastActivityAt: lastProgress?.updated_at || enrollment.enrolled_at,
        totalLessons: totalLessons || 0,
        completedLessons: completedLessons || 0,
      };
    })
  );

  // 통계 데이터
  const totalStudents = new Set(enrollments?.map(e => e.user?.id)).size;
  const activeStudents = studentsWithStats.filter(s => {
    const lastActivity = new Date(s.lastActivityAt);
    const daysSinceActivity =
      (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceActivity <= 7;
  }).length;
  const completedStudents = studentsWithStats.filter(
    s => s.progressPercentage >= 100
  ).length;
  const averageProgress =
    studentsWithStats.length > 0
      ? Math.round(
          studentsWithStats.reduce((sum, s) => sum + s.progressPercentage, 0) /
            studentsWithStats.length
        )
      : 0;

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* 헤더 */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>수강생 관리</h1>
          <p className='text-gray-600 mt-2'>
            수강생들의 학습 현황을 확인하고 관리하세요
          </p>
        </div>

        {/* 통계 카드 */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center'>
                <UsersIcon className='h-6 w-6 text-primary-600' />
              </div>
              <span className='text-sm text-gray-500'>전체</span>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              {totalStudents}명
            </div>
            <p className='text-sm text-gray-600 mt-1'>총 수강생</p>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                <ChartBarIcon className='h-6 w-6 text-green-600' />
              </div>
              <span className='text-sm text-gray-500'>최근 7일</span>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              {activeStudents}명
            </div>
            <p className='text-sm text-gray-600 mt-1'>활성 수강생</p>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-fitness-100 rounded-lg flex items-center justify-center'>
                <AcademicCapIcon className='h-6 w-6 text-fitness-600' />
              </div>
              <span className='text-sm text-gray-500'>완료</span>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              {completedStudents}명
            </div>
            <p className='text-sm text-gray-600 mt-1'>수료생</p>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center'>
                <ChartBarIcon className='h-6 w-6 text-yellow-600' />
              </div>
              <span className='text-sm text-gray-500'>평균</span>
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              {averageProgress}%
            </div>
            <p className='text-sm text-gray-600 mt-1'>진도율</p>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className='bg-white rounded-xl shadow-soft p-6 mb-6'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1 relative'>
              <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
              <input
                type='text'
                placeholder='이름 또는 이메일로 검색...'
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              />
            </div>
            <select className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'>
              <option value=''>모든 강의</option>
              {courses?.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <select className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'>
              <option value=''>모든 상태</option>
              <option value='active'>학습 중</option>
              <option value='completed'>완료</option>
              <option value='inactive'>비활성</option>
            </select>
          </div>
        </div>

        {/* 수강생 목록 */}
        <div className='bg-white rounded-xl shadow-soft overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    수강생
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    강의
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    진도율
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    수강 시작일
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    마지막 학습
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {studentsWithStats.map(student => {
                  const daysSinceActivity = Math.floor(
                    (Date.now() - new Date(student.lastActivityAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  );

                  return (
                    <tr key={student.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='h-10 w-10 flex-shrink-0'>
                            {student.user?.avatar ? (
                              <Image
                                className='h-10 w-10 rounded-full'
                                src={student.user.avatar}
                                alt={student.user.name || ''}
                                width={40}
                                height={40}
                              />
                            ) : (
                              <div className='h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center'>
                                <span className='text-primary-600 font-medium'>
                                  {(student.user?.name ||
                                    student.user?.email ||
                                    '?')[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-medium text-gray-900'>
                              {student.user?.name || '이름 없음'}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {student.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {student.course?.title}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='flex-1 mr-4'>
                            <div className='w-full bg-gray-200 rounded-full h-2'>
                              <div
                                className={`h-2 rounded-full ${
                                  student.progressPercentage >= 100
                                    ? 'bg-green-600'
                                    : student.progressPercentage >= 50
                                      ? 'bg-yellow-600'
                                      : 'bg-primary-600'
                                }`}
                                style={{
                                  width: `${student.progressPercentage}%`,
                                }}
                              />
                            </div>
                          </div>
                          <span className='text-sm text-gray-600'>
                            {student.progressPercentage}%
                          </span>
                        </div>
                        <div className='text-xs text-gray-500 mt-1'>
                          {student.completedLessons}/{student.totalLessons} 레슨
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {new Date(student.enrolled_at).toLocaleDateString(
                          'ko-KR'
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {daysSinceActivity === 0
                          ? '오늘'
                          : daysSinceActivity === 1
                            ? '어제'
                            : `${daysSinceActivity}일 전`}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        <div className='flex space-x-2'>
                          <button className='text-primary-600 hover:text-primary-900'>
                            <EnvelopeIcon className='h-5 w-5' />
                          </button>
                          <button className='text-gray-600 hover:text-gray-900'>
                            <ChartBarIcon className='h-5 w-5' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {(!studentsWithStats || studentsWithStats.length === 0) && (
            <div className='text-center py-12'>
              <UsersIcon className='h-12 w-12 text-gray-300 mx-auto mb-4' />
              <p className='text-gray-500'>아직 수강생이 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
