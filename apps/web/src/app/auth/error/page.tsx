'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorCode = searchParams.get('error_code');
  const errorDescription = searchParams.get('error_description');

  // 에러 메시지 파싱
  let errorMessage = '인증 처리 중 오류가 발생했습니다.';
  let errorDetail = '';
  let suggestion = '';

  if (errorCode === 'otp_expired' || errorDescription?.includes('expired')) {
    errorMessage = '이메일 인증 링크가 만료되었습니다';
    errorDetail = '이메일 인증 링크는 보안을 위해 일정 시간 후 만료됩니다.';
    suggestion = '다시 로그인하여 새로운 인증 이메일을 받아주세요.';
  } else if (errorDescription?.includes('already confirmed')) {
    errorMessage = '이미 인증된 이메일입니다';
    errorDetail = '이메일 인증이 이미 완료되었습니다.';
    suggestion = '로그인 페이지로 이동하여 로그인해주세요.';
  } else if (error || errorDescription) {
    errorMessage = '인증 처리 실패';
    errorDetail =
      error || errorDescription || '알 수 없는 오류가 발생했습니다.';
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100'>
            <XCircleIcon className='h-6 w-6 text-red-600' />
          </div>
          <h2 className='mt-6 text-center text-3xl font-bold text-gray-900'>
            {errorMessage}
          </h2>
          {errorDetail && (
            <p className='mt-2 text-center text-sm text-gray-600'>
              {errorDetail}
            </p>
          )}
          {suggestion && (
            <p className='mt-4 text-center text-sm font-medium text-gray-900'>
              {suggestion}
            </p>
          )}
        </div>

        <div className='mt-8 space-y-4'>
          <Link
            href='/auth/login'
            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
          >
            로그인 페이지로 이동
          </Link>
          <Link
            href='/'
            className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
          >
            홈으로 돌아가기
          </Link>
        </div>

        <div className='mt-6'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-gray-50 text-gray-500'>
                도움이 필요하신가요?
              </span>
            </div>
          </div>

          <div className='mt-6 text-center'>
            <a
              href='#'
              className='text-sm text-primary-600 hover:text-primary-500'
            >
              고객센터 문의하기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}