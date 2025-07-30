import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  KeyIcon,
  BellIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  CameraIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

export default async function ProfilePage() {
  // 현재 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 사용자 프로필 정보
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        {/* 헤더 */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>내 프로필</h1>
          <p className='text-gray-600 mt-2'>
            프로필 정보와 계정 설정을 관리하세요
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* 프로필 정보 */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-xl shadow-soft p-6'>
              <div className='text-center'>
                <div className='relative inline-block'>
                  {profile?.avatar ? (
                    <Image
                      src={profile.avatar}
                      alt={profile.name || ''}
                      width={120}
                      height={120}
                      className='rounded-full object-cover'
                    />
                  ) : (
                    <div className='w-30 h-30 bg-primary-100 rounded-full flex items-center justify-center'>
                      <UserIcon className='h-12 w-12 text-primary-600' />
                    </div>
                  )}
                  <button className='absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 transition-colors'>
                    <CameraIcon className='h-4 w-4' />
                  </button>
                </div>

                <h2 className='text-xl font-bold text-gray-900 mt-4'>
                  {profile?.name || '이름을 설정해주세요'}
                </h2>
                <p className='text-gray-600'>{user.email}</p>

                <div className='mt-4 text-sm text-gray-500'>
                  가입일:{' '}
                  {new Date(user.created_at).toLocaleDateString('ko-KR')}
                </div>

                <button className='mt-4 w-full btn-outline'>
                  프로필 사진 변경
                </button>
              </div>
            </div>

            {/* 계정 통계 */}
            <div className='bg-white rounded-xl shadow-soft p-6 mt-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                계정 활동
              </h3>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>수강 중인 강의</span>
                  <span className='font-medium'>3개</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>완료한 강의</span>
                  <span className='font-medium'>12개</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>총 학습 시간</span>
                  <span className='font-medium'>45시간</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>획득 수료증</span>
                  <span className='font-medium'>8개</span>
                </div>
              </div>
            </div>
          </div>

          {/* 설정 섹션 */}
          <div className='lg:col-span-2 space-y-6'>
            {/* 개인 정보 */}
            <div className='bg-white rounded-xl shadow-soft p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  개인 정보
                </h3>
                <button className='text-primary-600 hover:text-primary-700 flex items-center'>
                  <PencilIcon className='h-4 w-4 mr-1' />
                  수정
                </button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    이름
                  </label>
                  <div className='flex items-center p-3 bg-gray-50 rounded-lg'>
                    <UserIcon className='h-5 w-5 text-gray-400 mr-3' />
                    <span className='text-gray-900'>
                      {profile?.name || '설정되지 않음'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    이메일
                  </label>
                  <div className='flex items-center p-3 bg-gray-50 rounded-lg'>
                    <EnvelopeIcon className='h-5 w-5 text-gray-400 mr-3' />
                    <span className='text-gray-900'>{user.email}</span>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    전화번호
                  </label>
                  <div className='flex items-center p-3 bg-gray-50 rounded-lg'>
                    <PhoneIcon className='h-5 w-5 text-gray-400 mr-3' />
                    <span className='text-gray-900'>
                      {profile?.phone || '설정되지 않음'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    생년월일
                  </label>
                  <div className='flex items-center p-3 bg-gray-50 rounded-lg'>
                    <CalendarIcon className='h-5 w-5 text-gray-400 mr-3' />
                    <span className='text-gray-900'>
                      {profile?.birth_date || '설정되지 않음'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 보안 설정 */}
            <div className='bg-white rounded-xl shadow-soft p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-6'>
                보안 설정
              </h3>

              <div className='space-y-4'>
                <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                  <div className='flex items-center'>
                    <KeyIcon className='h-5 w-5 text-gray-400 mr-3' />
                    <div>
                      <h4 className='text-sm font-medium text-gray-900'>
                        비밀번호
                      </h4>
                      <p className='text-sm text-gray-500'>
                        마지막 변경: 2024년 1월 15일
                      </p>
                    </div>
                  </div>
                  <button className='text-primary-600 hover:text-primary-700 text-sm font-medium'>
                    변경하기
                  </button>
                </div>

                <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                  <div className='flex items-center'>
                    <ShieldCheckIcon className='h-5 w-5 text-gray-400 mr-3' />
                    <div>
                      <h4 className='text-sm font-medium text-gray-900'>
                        2단계 인증
                      </h4>
                      <p className='text-sm text-gray-500'>
                        계정 보안을 강화하세요
                      </p>
                    </div>
                  </div>
                  <button className='text-primary-600 hover:text-primary-700 text-sm font-medium'>
                    설정하기
                  </button>
                </div>
              </div>
            </div>

            {/* 알림 설정 */}
            <div className='bg-white rounded-xl shadow-soft p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-6'>
                알림 설정
              </h3>

              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <BellIcon className='h-5 w-5 text-gray-400 mr-3' />
                    <div>
                      <h4 className='text-sm font-medium text-gray-900'>
                        이메일 알림
                      </h4>
                      <p className='text-sm text-gray-500'>
                        새로운 강의 및 업데이트 알림
                      </p>
                    </div>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      defaultChecked
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <BellIcon className='h-5 w-5 text-gray-400 mr-3' />
                    <div>
                      <h4 className='text-sm font-medium text-gray-900'>
                        강의 시작 알림
                      </h4>
                      <p className='text-sm text-gray-500'>
                        수강 중인 강의 업데이트 알림
                      </p>
                    </div>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      defaultChecked
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <BellIcon className='h-5 w-5 text-gray-400 mr-3' />
                    <div>
                      <h4 className='text-sm font-medium text-gray-900'>
                        마케팅 알림
                      </h4>
                      <p className='text-sm text-gray-500'>
                        할인 및 프로모션 정보
                      </p>
                    </div>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input type='checkbox' className='sr-only peer' />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* 결제 정보 */}
            <div className='bg-white rounded-xl shadow-soft p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-6'>
                결제 정보
              </h3>

              <div className='space-y-4'>
                <div className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                  <div className='flex items-center'>
                    <CreditCardIcon className='h-5 w-5 text-gray-400 mr-3' />
                    <div>
                      <h4 className='text-sm font-medium text-gray-900'>
                        등록된 카드
                      </h4>
                      <p className='text-sm text-gray-500'>
                        **** **** **** 1234
                      </p>
                    </div>
                  </div>
                  <button className='text-primary-600 hover:text-primary-700 text-sm font-medium'>
                    관리하기
                  </button>
                </div>

                <div className='text-center py-8 text-gray-500'>
                  <CreditCardIcon className='h-12 w-12 text-gray-300 mx-auto mb-4' />
                  <p className='text-sm'>등록된 결제 수단이 없습니다</p>
                  <button className='mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium'>
                    결제 수단 추가하기
                  </button>
                </div>
              </div>
            </div>

            {/* 계정 관리 */}
            <div className='bg-white rounded-xl shadow-soft p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-6'>
                계정 관리
              </h3>

              <div className='space-y-4'>
                <button className='w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'>
                  <h4 className='text-sm font-medium text-gray-900'>
                    데이터 다운로드
                  </h4>
                  <p className='text-sm text-gray-500'>
                    내 계정 데이터를 다운로드받으세요
                  </p>
                </button>

                <button className='w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors'>
                  <h4 className='text-sm font-medium text-red-900'>
                    계정 삭제
                  </h4>
                  <p className='text-sm text-red-600'>
                    계정을 영구적으로 삭제합니다
                  </p>
                </button>
              </div>
            </div>

            {/* 저장 버튼 */}
            <div className='flex justify-end space-x-4'>
              <button className='btn-outline'>취소</button>
              <button className='btn-primary'>변경사항 저장</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
