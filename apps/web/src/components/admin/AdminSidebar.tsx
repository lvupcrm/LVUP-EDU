'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon,
  UsersIcon,
  AcademicCapIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
  StarIcon,
  DocumentCheckIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: '대시보드', href: '/admin', icon: HomeIcon },
  { name: '사용자 관리', href: '/admin/users', icon: UsersIcon },
  { name: '코스 관리', href: '/admin/courses', icon: AcademicCapIcon },
  { name: '주문 관리', href: '/admin/orders', icon: ShoppingCartIcon },
  { name: '수강 관리', href: '/admin/enrollments', icon: CurrencyDollarIcon },
  { name: '강사 관리', href: '/admin/instructors', icon: UserGroupIcon },
  { name: 'Q&A 관리', href: '/admin/qa', icon: QuestionMarkCircleIcon },
  { name: '리뷰 관리', href: '/admin/reviews', icon: StarIcon },
  { name: '수료증 관리', href: '/admin/certificates', icon: DocumentCheckIcon },
  { name: '통계', href: '/admin/analytics', icon: ChartBarIcon },
  { name: '설정', href: '/admin/settings', icon: CogIcon },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* 모바일 메뉴 버튼 */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          type="button"
          className="p-2 rounded-md bg-white shadow-lg"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Bars3Icon className="h-6 w-6 text-gray-900" />
        </button>
      </div>

      {/* 사이드바 */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 transform transition-transform duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex h-full flex-col">
          {/* 로고 */}
          <div className="flex h-16 items-center px-6 bg-gray-800">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-fitness-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-white">Admin</span>
            </Link>
            
            {/* 모바일 닫기 버튼 */}
            <button
              type="button"
              className="ml-auto lg:hidden p-1 text-gray-400 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* 네비게이션 */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0 transition-colors
                      ${isActive
                        ? 'text-white'
                        : 'text-gray-400 group-hover:text-white'
                      }
                    `}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* 하단 정보 */}
          <div className="border-t border-gray-800 p-4">
            <Link
              href="/"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <HomeIcon className="mr-3 h-5 w-5 text-gray-400" />
              사이트로 돌아가기
            </Link>
          </div>
        </div>
      </div>

      {/* 모바일 배경 오버레이 */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}