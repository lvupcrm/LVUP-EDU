'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid'

export default function WelcomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        // 안전한 Supabase 동적 import
        const { getSupabaseClient, isSupabaseReady, safeSupabaseOperation } = await import('@/lib/supabase')

        if (!isSupabaseReady()) {
          console.warn('Supabase client not ready')
          setLoading(false)
          return
        }

        // 안전한 사용자 정보 가져오기
        const authUser = await safeSupabaseOperation(async (client) => {
          const { data: { user } } = await client.auth.getUser()
          return user
        })

        if (authUser) {
          // 안전한 프로필 정보 가져오기
          const profile = await safeSupabaseOperation(async (client) => {
            const { data } = await client
              .from('users')
              .select('*')
              .eq('id', authUser.id)
              .single()
            return data
          })
          
          setUser({
            ...authUser,
            ...profile,
            userType: authUser.user_metadata?.user_type || profile?.user_type || 'TRAINER'
          })
        }
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        setLoading(false)
      }
    }
    getUser()
  }, [])

  const getUserTypeLabel = (userType: string) => {
    const types: { [key: string]: string } = {
      TRAINER: '트레이너',
      OPERATOR: '센터 운영자',
      MANAGER: '센터 관리자',
      FREELANCER: '프리랜서',
      ENTREPRENEUR: '예정 창업자',
    }
    return types[userType] || userType
  }

  const getRecommendedCourses = (userType: string) => {
    const recommendations: { [key: string]: { category: string; courses: string[] } } = {
      TRAINER: {
        category: '트레이너 교육',
        courses: ['기초 해부학', '프로그램 설계', 'CPT 자격증 대비']
      },
      OPERATOR: {
        category: '운영자 교육',
        courses: ['센터 창업 가이드', '매출 관리', '마케팅 전략']
      },
      MANAGER: {
        category: '관리자 교육',
        courses: ['팀 리더십', '고객 관리', '운영 효율화']
      },
      FREELANCER: {
        category: '프리랜서 교육',
        courses: ['개인 브랜딩', '고객 유치', '온라인 마케팅']
      },
      ENTREPRENEUR: {
        category: '창업자 교육',
        courses: ['사업 계획서', '자금 조달', '브랜드 구축']
      },
    }
    return recommendations[userType] || recommendations.TRAINER
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">사용자 정보를 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-6">로그인 후 다시 시도해주세요.</p>
          <Link href="/auth/login" className="btn-primary">
            로그인 페이지로 이동
          </Link>
        </div>
      </div>
    )
  }

  const recommended = getRecommendedCourses(user.userType)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-fitness-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* 웰컴 메시지 */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎉 회원가입이 완료되었습니다!
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              <strong className="text-primary-600">{user.name}</strong>님, LVUP EDU에 오신 것을 환영합니다!
            </p>
            <p className="text-gray-500">
              <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                {getUserTypeLabel(user.userType)}
              </span>
              로 등록되었습니다
            </p>
          </div>

          {/* 다음 단계 안내 */}
          <div className="bg-white rounded-2xl shadow-soft p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              이제 무엇을 해볼까요?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 border border-gray-100 rounded-xl hover:border-primary-200 transition-colors">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">강의 둘러보기</h3>
                <p className="text-sm text-gray-600">다양한 전문 강의를 확인해보세요</p>
              </div>

              <div className="text-center p-4 border border-gray-100 rounded-xl hover:border-primary-200 transition-colors">
                <div className="w-12 h-12 bg-fitness-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">👨‍🏫</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">강사진 소개</h3>
                <p className="text-sm text-gray-600">현장 전문가들을 만나보세요</p>
              </div>

              <div className="text-center p-4 border border-gray-100 rounded-xl hover:border-primary-200 transition-colors">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">자격증 과정</h3>
                <p className="text-sm text-gray-600">체계적인 자격증 준비</p>
              </div>
            </div>

            {/* 맞춤 추천 강의 */}
            <div className="bg-gradient-to-r from-primary-50 to-fitness-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🎯 {user.name}님을 위한 추천 강의
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {recommended.courses.map((course, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 text-center">
                    <div className="text-sm font-medium text-gray-900">{course}</div>
                    <div className="text-xs text-gray-500 mt-1">{recommended.category}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/courses"
                className="btn-primary text-lg px-8 py-3 group"
              >
                강의 둘러보기
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/"
                className="btn-outline text-lg px-8 py-3"
              >
                메인으로 이동
              </Link>
            </div>
          </div>

          {/* 추가 혜택 안내 */}
          <div className="bg-gradient-to-r from-fitness-500 to-primary-500 rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-4">🎁 신규 회원 특별 혜택</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <CheckCircleIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium">첫 강의 30% 할인</div>
                  <div className="text-sm text-white/80">회원가입 후 7일간 유효</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <CheckCircleIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium">무료 체험 강의</div>
                  <div className="text-sm text-white/80">모든 강의의 첫 번째 레슨</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <CheckCircleIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium">전문가 1:1 상담</div>
                  <div className="text-sm text-white/80">학습 방향 설정 도움</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <CheckCircleIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium">커뮤니티 액세스</div>
                  <div className="text-sm text-white/80">전국 피트니스 전문가 네트워크</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}