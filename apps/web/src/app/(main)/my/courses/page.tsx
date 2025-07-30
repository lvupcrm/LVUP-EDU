import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpenIcon,
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CalendarIcon,
  AcademicCapIcon,
  DocumentArrowDownIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

export default async function MyCourses() {
  // 현재 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 사용자의 수강 내역 가져오기
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(
      `
      id,
      enrolled_at,
      status,
      course:courses(
        id,
        title,
        description,
        thumbnail,
        price,
        total_duration,
        difficulty_level,
        instructor:instructor_profiles(
          user:users(name, avatar)
        )
      )
    `
    )
    .eq('user_id', user.id)
    .order('enrolled_at', { ascending: false });

  // 각 강의별 진도 정보 가져오기
  const enrollmentsWithProgress = await Promise.all(
    (enrollments || []).map(async enrollment => {
      // 전체 레슨 수
      const { count: totalLessons } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', enrollment.course.id);

      // 완료한 레슨 수와 진도 정보
      const { count: completedLessons } = await supabase
        .from('lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('enrollment_id', enrollment.id)
        .eq('status', 'COMPLETED');

      // 마지막 학습 진도
      const { data: lastProgress } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('enrollment_id', enrollment.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      // 진도율 계산
      const progressPercentage = totalLessons
        ? Math.round(((completedLessons || 0) / totalLessons) * 100)
        : 0;

      // 수료증 발급 가능 여부 (90% 이상 완료)
      const canGetCertificate = progressPercentage >= 90;

      return {
        ...enrollment,
        totalLessons: totalLessons || 0,
        completedLessons: completedLessons || 0,
        progressPercentage,
        lastProgress,
        canGetCertificate,
      };
    })
  );

  // 상태별 분류
  const ongoingCourses = enrollmentsWithProgress.filter(
    e => e.progressPercentage > 0 && e.progressPercentage < 100
  );
  const completedCourses = enrollmentsWithProgress.filter(
    e => e.progressPercentage >= 100
  );
  const notStartedCourses = enrollmentsWithProgress.filter(
    e => e.progressPercentage === 0
  );

  // 통계
  const totalCourses = enrollmentsWithProgress.length;
  const completedCount = completedCourses.length;
  const totalStudyTime = enrollmentsWithProgress.reduce(
    (acc, e) => acc + (e.course.total_duration || 0),
    0
  );

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const CourseCard = ({ enrollment }: { enrollment: any }) => (
    <div className='bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-lg transition-shadow'>
      <div className='relative'>
        <Image
          src={enrollment.course.thumbnail || '/default-course.svg'}
          alt={enrollment.course.title}
          width={400}
          height={200}
          className='w-full h-48 object-cover'
        />
        <div className='absolute top-4 right-4'>
          {enrollment.progressPercentage >= 100 ? (
            <div className='bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center'>
              <CheckCircleIcon className='h-4 w-4 mr-1' />
              완료
            </div>
          ) : enrollment.progressPercentage > 0 ? (
            <div className='bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium'>
              진행중
            </div>
          ) : (
            <div className='bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium'>
              시작 전
            </div>
          )}
        </div>
      </div>

      <div className='p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          {enrollment.course.title}
        </h3>

        <div className='flex items-center text-sm text-gray-600 mb-3'>
          <div className='flex items-center mr-4'>
            {enrollment.course.instructor?.user?.avatar ? (
              <Image
                src={enrollment.course.instructor.user.avatar}
                alt=''
                width={20}
                height={20}
                className='rounded-full mr-2'
              />
            ) : (
              <div className='w-5 h-5 bg-gray-300 rounded-full mr-2'></div>
            )}
            <span>{enrollment.course.instructor?.user?.name}</span>
          </div>
          <div className='flex items-center'>
            <ClockIcon className='h-4 w-4 mr-1' />
            <span>{formatDuration(enrollment.course.total_duration || 0)}</span>
          </div>
        </div>

        {/* 진도율 바 */}
        <div className='mb-4'>
          <div className='flex justify-between items-center mb-2'>
            <span className='text-sm text-gray-600'>진도율</span>
            <span className='text-sm font-medium text-gray-900'>
              {enrollment.progressPercentage}%
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                enrollment.progressPercentage >= 100
                  ? 'bg-green-500'
                  : enrollment.progressPercentage >= 50
                    ? 'bg-yellow-500'
                    : 'bg-primary-500'
              }`}
              style={{ width: `${enrollment.progressPercentage}%` }}
            />
          </div>
          <div className='text-xs text-gray-500 mt-1'>
            {enrollment.completedLessons}/{enrollment.totalLessons} 레슨 완료
          </div>
        </div>

        <div className='flex justify-between items-center'>
          <div className='text-sm text-gray-500'>
            수강 시작:{' '}
            {new Date(enrollment.enrolled_at).toLocaleDateString('ko-KR')}
          </div>

          <div className='flex space-x-2'>
            {enrollment.canGetCertificate && (
              <Link
                href={`/certificates/${enrollment.course.id}`}
                className='text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50'
                title='수료증 발급'
              >
                <DocumentArrowDownIcon className='h-5 w-5' />
              </Link>
            )}
            <Link
              href={`/courses/${enrollment.course.id}`}
              className='btn-primary text-sm px-4 py-2'
            >
              {enrollment.progressPercentage > 0 ? '이어보기' : '시작하기'}
              <PlayIcon className='h-4 w-4 ml-1' />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {/* 헤더 */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>내 강의</h1>
          <p className='text-gray-600'>
            수강 중인 강의와 완료한 강의를 확인하세요
          </p>
        </div>

        {/* 통계 카드 */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center'>
              <div className='p-3 bg-primary-100 rounded-lg'>
                <BookOpenIcon className='h-6 w-6 text-primary-600' />
              </div>
              <div className='ml-4'>
                <p className='text-sm text-gray-600'>수강 중인 강의</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {totalCourses}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center'>
              <div className='p-3 bg-green-100 rounded-lg'>
                <AcademicCapIcon className='h-6 w-6 text-green-600' />
              </div>
              <div className='ml-4'>
                <p className='text-sm text-gray-600'>완료한 강의</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {completedCount}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-soft p-6'>
            <div className='flex items-center'>
              <div className='p-3 bg-blue-100 rounded-lg'>
                <ClockIcon className='h-6 w-6 text-blue-600' />
              </div>
              <div className='ml-4'>
                <p className='text-sm text-gray-600'>총 학습 시간</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {formatDuration(totalStudyTime)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 탭 */}
        <div className='mb-6'>
          <div className='border-b border-gray-200'>
            <nav className='-mb-px flex space-x-8'>
              <button className='border-primary-500 text-primary-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'>
                전체 ({totalCourses})
              </button>
              <button className='border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'>
                진행중 ({ongoingCourses.length})
              </button>
              <button className='border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'>
                완료 ({completedCourses.length})
              </button>
              <button className='border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'>
                시작 전 ({notStartedCourses.length})
              </button>
            </nav>
          </div>
        </div>

        {/* 강의 목록 */}
        {enrollmentsWithProgress.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {enrollmentsWithProgress.map(enrollment => (
              <CourseCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        ) : (
          <div className='text-center py-16'>
            <BookOpenIcon className='h-16 w-16 text-gray-300 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              아직 수강 중인 강의가 없습니다
            </h3>
            <p className='text-gray-500 mb-6'>
              새로운 강의를 찾아서 학습을 시작해보세요!
            </p>
            <Link href='/courses' className='btn-primary'>
              강의 둘러보기
            </Link>
          </div>
        )}

        {/* 추천 섹션 */}
        {enrollmentsWithProgress.length > 0 && (
          <div className='mt-12 bg-gradient-to-r from-primary-50 to-fitness-50 rounded-xl p-8'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                학습을 계속해보세요! 🎯
              </h2>
              <p className='text-gray-600 mb-6'>
                관심사와 학습 이력을 바탕으로 추천하는 새로운 강의들을
                확인해보세요
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Link href='/courses' className='btn-primary'>
                  추천 강의 보기
                </Link>
                <Link href='/my/dashboard' className='btn-outline'>
                  학습 통계 확인
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
