'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';

interface KakaoLoginButtonProps {
  variant?: 'login' | 'signup';
  redirectTo?: string;
  className?: string;
}

export function KakaoLoginButton({
  variant = 'login',
  redirectTo = '/',
  className = '',
}: KakaoLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleKakaoLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) {
        console.error('Kakao login error:', error);
        toast({
          variant: 'destructive',
          title: '로그인 실패',
          description:
            '카카오 로그인 중 오류가 발생했습니다. 다시 시도해주세요.',
        });
        setIsLoading(false);
      }
      // 성공 시에는 리다이렉트되므로 loading 상태를 유지
    } catch (err) {
      console.error('Unexpected error during Kakao login:', err);
      toast({
        variant: 'destructive',
        title: '로그인 실패',
        description: '예상치 못한 오류가 발생했습니다. 다시 시도해주세요.',
      });
      setIsLoading(false);
    }
  };

  const buttonText = {
    login: '카카오로 로그인',
    signup: '카카오로 시작하기',
  }[variant];

  return (
    <button
      onClick={handleKakaoLogin}
      disabled={isLoading}
      className={`
        w-full flex items-center justify-center gap-3 px-4 py-3 
        bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-300
        text-gray-900 font-medium rounded-lg transition-colors
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <LoadingSpinner size='sm' className='text-gray-900' />
      ) : (
        <KakaoIcon />
      )}
      <span>{isLoading ? '로그인 중...' : buttonText}</span>
    </button>
  );
}

function KakaoIcon() {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 20 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='flex-shrink-0'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M10 0C4.477 0 0 3.582 0 8c0 3.138 2.328 5.893 5.862 7.186-.227-.898-.432-2.278.092-3.267.475-.896 3.073-13.002 3.073-13.002s-.784 4.179.378 4.998c1.161.819 3.78-2.004 3.78-2.004s-.473 5.376 2.172 5.376c2.645 0 2.172-5.376 2.172-5.376s2.619 2.823 3.78 2.004c1.162-.819.378-4.998.378-4.998s2.598 12.106 3.073 13.002c.524.989.319 2.369.092 3.267C17.672 13.893 20 11.138 20 8c0-4.418-4.477-8-10-8Z'
        fill='currentColor'
      />
    </svg>
  );
}
