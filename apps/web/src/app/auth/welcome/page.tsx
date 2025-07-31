'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircleIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/solid';

function WelcomeContent() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const emailConfirmationRequired =
    searchParams.get('emailConfirmation') === 'required';
  const emailConfirmed = searchParams.get('emailConfirmed') === 'true';

  useEffect(() => {
    const getUser = async () => {
      try {
        // 안전한 Supabase 동적 import
        const { getSupabaseClient, isSupabaseReady, safeSupabaseOperation } =
          await import('@/lib/supabase');

        if (!isSupabaseReady()) {
          console.warn('Supabase client not ready');
          setLoading(false);
          return;
        }

        // 안전한 사용자 정보 가져오기
        const authUser = await safeSupabaseOperation(async client => {
          const {
            data: { user },
          } = await client.auth.getUser();
          return user;
        });

        if (authUser) {
          // 안전한 프로필 정보 가져오기
          const profile = await safeSupabaseOperation(async client => {
            const { data } = await client
              .from('users')
              .select('*')
              .eq('id', authUser.id)
              .single();
            return data;
          });

          setUser({
            ...authUser,
            profile: profile || null,
          });
        }
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <div className='flex justify-center mb-4'>
            <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center'>
              <span className='text-white font-bold text-xl'>L</span>
            </div>
          </div>
          <h2 className='text-3xl font-bold text-gray-900'>LVUP EDU</h2>
          <p className='mt-2 text-gray-600'>피트니스 전문가들의 성장 파트너</p>
        </div>

        {emailConfirmationRequired && !emailConfirmed ? (
          // 이메일 인증 대기 상태
          <div className='bg-white rounded-xl shadow-soft p-8 text-center'>
            <div className='w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6'>
              <ExclamationTriangleIcon className='w-8 h-8 text-yellow-600' />
            </div>
            <h1 className='text-2xl font-bold text-gray-900 mb-4'>
              이메일 인증이 필요합니다
            </h1>
            <p className='text-gray-600 mb-6'>
              가입하신 이메일 주소로 인증 메일을 발송했습니다.
              <br />
              메일함을 확인하고 인증 링크를 클릭해주세요.
            </p>
            <div className='space-y-3'>
              <p className='text-sm text-gray-500'>
                이메일을 받지 못하셨나요? 스팸 메일함도 확인해보세요.
              </p>
            </div>
          </div>
        ) : (
          // 가입 완료 및 환영 메시지
          <div className='bg-white rounded-xl shadow-soft p-8 text-center'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
              <CheckCircleIcon className='w-8 h-8 text-green-600' />
            </div>
            <h1 className='text-2xl font-bold text-gray-900 mb-4'>
              환영합니다{user?.profile?.name ? `, ${user.profile.name}님!` : '!'}
            </h1>
            <p className='text-gray-600 mb-8'>
              LVUP EDU에 성공적으로 가입되었습니다.
              <br />
              이제 다양한 피트니스 전문 교육을 수강하실 수 있습니다.
            </p>

            <div className='space-y-3'>
              <Link
                href='/courses'
                className='w-full btn-primary flex items-center justify-center'
              >
                강의 둘러보기
                <ArrowRightIcon className='w-4 h-4 ml-2' />
              </Link>
              <Link
                href='/my/profile'
                className='w-full btn-outline'
              >
                프로필 설정하기
              </Link>
            </div>
          </div>
        )}

        <div className='text-center'>
          <p className='text-sm text-gray-500'>
            문의사항이 있으시면{' '}
            <a
              href='#'
              className='text-primary-600 hover:text-primary-500'
            >
              고객센터
            </a>
            로 연락해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>페이지를 불러오는 중...</p>
        </div>
      </div>
    }>
      <WelcomeContent />
    </Suspense>
  );
}