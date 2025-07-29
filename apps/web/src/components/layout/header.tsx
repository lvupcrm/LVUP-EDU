'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
// Supabase는 동적 import로 사용하여 hydration 문제 방지

const navigation: Array<{
  name: string;
  href: string;
  children?: Array<{ name: string; href: string }>;
}> = [
  {
    name: '강의',
    href: '/courses',
    children: [
      { name: '전체 강의', href: '/courses' },
      { name: '트레이너 교육', href: '/courses?category=trainer' },
      { name: '운영자 교육', href: '/courses?category=operator' },
    ],
  },
  { name: '강사진', href: '/instructors' },
  { name: '수료증', href: '/certificates' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 현재 사용자 세션 확인
    const checkUser = async () => {
      try {
        // Supabase 동적 import
        const { supabase } = await import('@/lib/supabase');

        if (!supabase) {
          setLoading(false);
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          // 사용자 프로필 정보 가져오기
          const { data: profile } = await supabase
            .from('users')
            .select('name, avatar')
            .eq('id', user.id)
            .single();

          setUser({
            ...user,
            name: profile?.name || user.email?.split('@')[0],
            avatar: profile?.avatar,
          });
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // 인증 상태 변경 리스너 설정
    let subscription: any = null;
    const setupListener = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        if (supabase) {
          const { data } = supabase.auth.onAuthStateChange(
            (_event, session) => {
              if (session?.user) {
                checkUser();
              } else {
                setUser(null);
              }
            }
          );
          subscription = data;
        }
      } catch (error) {
        console.error('Error setting up auth listener:', error);
      }
    };
    setupListener();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      if (supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className='sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100'>
      <nav
        className='container flex items-center justify-between h-16'
        aria-label='Global'
      >
        {/* 로고 */}
        <div className='flex lg:flex-1'>
          <Link href='/' className='-m-1.5 p-1.5'>
            <span className='sr-only'>LVUP EDU</span>
            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-gradient-to-r from-primary-500 to-fitness-500 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>L</span>
              </div>
              <span className='text-xl font-bold text-gray-900'>LVUP EDU</span>
            </div>
          </Link>
        </div>

        {/* 모바일 메뉴 버튼 */}
        <div className='flex lg:hidden'>
          <button
            type='button'
            className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700'
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className='sr-only'>메뉴 열기</span>
            <Bars3Icon className='h-6 w-6' aria-hidden='true' />
          </button>
        </div>

        {/* 데스크톱 네비게이션 */}
        <div className='hidden lg:flex lg:gap-x-8'>
          {navigation.map(item => (
            <div key={item.name} className='relative group'>
              <Link
                href={item.href}
                className='text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors flex items-center'
              >
                {item.name}
                {item.children && (
                  <svg
                    className='ml-1 h-4 w-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                )}
              </Link>

              {/* 드롭다운 메뉴 */}
              {item.children && (
                <div className='absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-soft border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'>
                  <div className='py-1'>
                    {item.children.map(child => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 검색바 */}
        <div className='hidden md:flex flex-1 max-w-lg mx-8'>
          <div className='relative w-full'>
            <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
            <input
              type='text'
              placeholder='배우고 싶은 강의를 검색해보세요'
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            />
          </div>
        </div>

        {/* 사용자 메뉴 */}
        <div className='hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-x-4'>
          {loading ? (
            <div className='h-8 w-20 bg-gray-200 rounded animate-pulse' />
          ) : user ? (
            <div className='flex items-center gap-x-4'>
              <Link
                href='/my/courses'
                className='text-sm font-medium text-gray-700 hover:text-primary-600'
              >
                내 강의
              </Link>
              <Link
                href='/my/orders'
                className='text-sm font-medium text-gray-700 hover:text-primary-600'
              >
                주문내역
              </Link>
              <div className='relative group'>
                <button className='flex items-center gap-x-2 text-sm font-medium text-gray-700 hover:text-primary-600'>
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt='프로필'
                      className='h-8 w-8 rounded-full'
                    />
                  ) : (
                    <UserIcon className='h-8 w-8 p-1 bg-gray-100 rounded-full' />
                  )}
                  <span>{user.name}</span>
                </button>

                {/* 드롭다운 메뉴 */}
                <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-soft border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200'>
                  <div className='py-1'>
                    <Link
                      href='/my/profile'
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
                    >
                      프로필 설정
                    </Link>
                    <Link
                      href='/my/courses'
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
                    >
                      수강 관리
                    </Link>
                    <Link
                      href='/my/orders'
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
                    >
                      주문 내역
                    </Link>
                    <Link
                      href='/my/certificates'
                      className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
                    >
                      수료증
                    </Link>
                    <hr className='my-1' />
                    <button
                      onClick={handleSignOut}
                      className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='flex items-center gap-x-4'>
              <Link
                href='/auth/login'
                className='text-sm font-medium text-gray-700 hover:text-primary-600'
              >
                로그인
              </Link>
              <Link href='/auth/signup' className='btn-primary text-sm'>
                회원가입
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* 모바일 메뉴 */}
      {mobileMenuOpen && (
        <div className='lg:hidden'>
          <div className='fixed inset-0 z-50' />
          <div className='fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10'>
            <div className='flex items-center justify-between'>
              <Link href='/' className='-m-1.5 p-1.5'>
                <span className='sr-only'>LVUP EDU</span>
                <div className='flex items-center space-x-2'>
                  <div className='w-8 h-8 bg-gradient-to-r from-primary-500 to-fitness-500 rounded-lg flex items-center justify-center'>
                    <span className='text-white font-bold text-sm'>L</span>
                  </div>
                  <span className='text-xl font-bold text-gray-900'>
                    LVUP EDU
                  </span>
                </div>
              </Link>
              <button
                type='button'
                className='-m-2.5 rounded-md p-2.5 text-gray-700'
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className='sr-only'>메뉴 닫기</span>
                <XMarkIcon className='h-6 w-6' aria-hidden='true' />
              </button>
            </div>
            <div className='mt-6 flow-root'>
              <div className='-my-6 divide-y divide-gray-500/10'>
                <div className='space-y-2 py-6'>
                  {navigation.map(item => (
                    <div key={item.name}>
                      <Link
                        href={item.href}
                        className='-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50'
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                      {item.children && (
                        <div className='ml-4 space-y-1'>
                          {item.children.map(child => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className='-mx-3 block rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-gray-50'
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className='py-6'>
                  {user ? (
                    <div className='space-y-2'>
                      <Link
                        href='/my/courses'
                        className='-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50'
                      >
                        내 강의
                      </Link>
                      <Link
                        href='/my/orders'
                        className='-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50'
                      >
                        주문 내역
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className='-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 w-full text-left'
                      >
                        로그아웃
                      </button>
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      <Link
                        href='/auth/login'
                        className='-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50'
                      >
                        로그인
                      </Link>
                      <Link
                        href='/auth/signup'
                        className='btn-primary w-full justify-center'
                      >
                        회원가입
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
