'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon } from '@heroicons/react/24/outline';

const userTypes = [
  {
    value: 'TRAINER',
    label: '트레이너',
    description: '피트니스 전문 지식과 기술을 배우고 싶어요',
  },
  {
    value: 'OPERATOR',
    label: '센터 운영자',
    description: '피트니스 센터 운영과 경영을 배우고 싶어요',
  },
];

export default function CompleteProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    userType: 'TRAINER',
    nickname: '',
    phone: '',
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { getSupabaseClient, isSupabaseReady, safeSupabaseOperation } =
          await import('@/lib/supabase');

        if (!isSupabaseReady()) {
          setError('인증 서비스 연결 실패');
          setLoading(false);
          return;
        }

        // 현재 로그인한 사용자 정보 가져오기
        const authUser = await safeSupabaseOperation(async client => {
          const {
            data: { user },
          } = await client.auth.getUser();
          return user;
        });

        if (!authUser) {
          // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
          router.push('/auth/login');
          return;
        }

        setUser(authUser);

        // 기존 프로필 정보 가져오기
        const profile = await safeSupabaseOperation(async client => {
          const { data } = await client
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();
          return data;
        });

        if (profile) {
          setFormData({
            name:
              profile.name ||
              authUser.user_metadata?.full_name ||
              authUser.user_metadata?.name ||
              '',
            userType: profile.user_type || 'TRAINER',
            nickname: profile.nickname || '',
            phone: profile.phone || '',
          });

          // 이미 프로필이 완성된 경우 홈으로 리다이렉트
          if (profile.name && profile.user_type) {
            router.push('/');
            return;
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setError('사용자 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      setError('이름을 입력해주세요.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const { getSupabaseClient, safeSupabaseOperation } = await import(
        '@/lib/supabase'
      );

      // 프로필 업데이트
      const result = await safeSupabaseOperation(async client => {
        const { error: updateError } = await client
          .from('users')
          .update({
            name: formData.name,
            user_type: formData.userType,
            nickname: formData.nickname || null,
            phone: formData.phone || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) {
          throw updateError;
        }

        return true;
      });

      if (result) {
        // 성공적으로 저장된 경우 환영 페이지로 이동
        router.push('/auth/welcome');
      } else {
        setError('프로필 저장 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError('프로필 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <div className='flex justify-center'>
            <div className='w-12 h-12 bg-gradient-to-r from-[#FEE500] to-[#FDD835] rounded-xl flex items-center justify-center'>
              <svg
                className='w-6 h-6'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M12 3C6.48 3 2 6.48 2 11.04C2 14.04 3.84 16.64 6.5 17.86V21.96L10.44 18.24C10.96 18.32 11.48 18.36 12 18.36C17.52 18.36 22 14.88 22 11.04C22 6.48 17.52 3 12 3Z'
                  fill='black'
                />
              </svg>
            </div>
          </div>
          <h2 className='mt-6 text-center text-3xl font-bold text-gray-900'>
            프로필을 완성해주세요
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            카카오 계정으로 가입되었습니다. 추가 정보를 입력해주세요.
          </p>
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
                이메일 (카카오 계정)
              </label>
              <input
                id='email'
                type='email'
                disabled
                value={user?.email || ''}
                className='input mt-1 bg-gray-100 cursor-not-allowed'
              />
            </div>

            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700'
              >
                이름 *
              </label>
              <input
                id='name'
                name='name'
                type='text'
                required
                value={formData.name}
                onChange={handleChange}
                className='input mt-1'
                placeholder='실명을 입력해주세요'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-3'>
                어떤 분야에 관심이 있으신가요? *
              </label>
              <div className='space-y-3'>
                {userTypes.map(type => (
                  <label
                    key={type.value}
                    className={`relative flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      formData.userType === type.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <input
                      type='radio'
                      name='userType'
                      value={type.value}
                      checked={formData.userType === type.value}
                      onChange={handleChange}
                      className='mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300'
                    />
                    <div className='ml-3 flex-1'>
                      <div className='text-sm font-medium text-gray-900'>
                        {type.label}
                      </div>
                      <div className='text-xs text-gray-500 mt-1'>
                        {type.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='nickname'
                  className='block text-sm font-medium text-gray-700'
                >
                  닉네임
                </label>
                <input
                  id='nickname'
                  name='nickname'
                  type='text'
                  value={formData.nickname}
                  onChange={handleChange}
                  className='input mt-1'
                  placeholder='선택사항'
                />
              </div>

              <div>
                <label
                  htmlFor='phone'
                  className='block text-sm font-medium text-gray-700'
                >
                  전화번호
                </label>
                <input
                  id='phone'
                  name='phone'
                  type='tel'
                  value={formData.phone}
                  onChange={handleChange}
                  className='input mt-1'
                  placeholder='010-1234-5678'
                />
              </div>
            </div>
          </div>

          <div className='flex flex-col space-y-4'>
            <button
              type='submit'
              disabled={saving}
              className='btn-primary w-full justify-center py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {saving ? (
                <div className='flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  저장 중...
                </div>
              ) : (
                '프로필 완성하기'
              )}
            </button>

            <div className='text-center text-sm text-gray-500'>
              <CheckIcon className='inline-block w-4 h-4 mr-1' />
              입력하신 정보는 언제든지 마이페이지에서 수정할 수 있습니다
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
