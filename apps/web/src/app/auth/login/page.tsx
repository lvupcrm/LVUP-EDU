'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 안전한 Supabase 동적 import
      const { getSupabaseClient, isSupabaseReady, safeSupabaseOperation } =
        await import('@/lib/supabase');

      if (!isSupabaseReady()) {
        setError(
          '인증 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
        );
        return;
      }

      // 안전한 로그인 시도
      const loginResult = await safeSupabaseOperation(async client => {
        const { data, error: signInError } =
          await client.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

        if (signInError) {
          throw new Error(
            signInError.message === 'Invalid login credentials'
              ? '이메일 또는 비밀번호가 올바르지 않습니다.'
              : signInError.message
          );
        }

        return data;
      });

      if (loginResult) {
        // 로그인 성공
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <div className='flex justify-center mb-4'>
            <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center'>
              <span className='text-white font-bold text-xl'>L</span>
            </div>
          </div>
          <h2 className='text-3xl font-bold text-gray-900'>LVUP EDU 로그인</h2>
          <p className='mt-2 text-gray-600'>피트니스 전문가들의 성장 파트너</p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm'>
              {error}
            </div>
          )}

          <div className='space-y-4'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'
              >
                이메일 주소
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                value={formData.email}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-1'
                placeholder='example@lvupedu.com'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'
              >
                비밀번호
              </label>
              <div className='relative mt-1'>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10'
                  placeholder='비밀번호를 입력하세요'
                />
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className='h-5 w-5 text-gray-400' />
                  ) : (
                    <EyeIcon className='h-5 w-5 text-gray-400' />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <input
                id='remember-me'
                name='remember-me'
                type='checkbox'
                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              />
              <label
                htmlFor='remember-me'
                className='ml-2 block text-sm text-gray-900'
              >
                로그인 상태 유지
              </label>
            </div>

            <div className='text-sm'>
              <Link
                href='/auth/forgot-password'
                className='font-medium text-blue-600 hover:text-blue-500'
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? (
              <div className='flex items-center justify-center'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                로그인 중...
              </div>
            ) : (
              '로그인'
            )}
          </button>

          <div className='text-center'>
            <span className='text-sm text-gray-600'>
              아직 계정이 없으신가요?{' '}
              <Link
                href='/auth/signup'
                className='font-medium text-blue-600 hover:text-blue-500'
              >
                회원가입
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
