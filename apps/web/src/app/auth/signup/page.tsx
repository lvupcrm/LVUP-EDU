'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'

const userTypes = [
  { value: 'TRAINER', label: '트레이너', description: '피트니스 전문 지식과 기술을 배우고 싶어요' },
  { value: 'OPERATOR', label: '센터 운영자', description: '피트니스 센터 운영과 경영을 배우고 싶어요' },
  { value: 'MANAGER', label: '센터 관리자', description: '센터 매니저로서 관리 역량을 기르고 싶어요' },
  { value: 'FREELANCER', label: '프리랜서', description: '개인 트레이너로 독립을 준비하고 있어요' },
  { value: 'ENTREPRENEUR', label: '예정 창업자', description: '피트니스 센터 창업을 계획하고 있어요' },
]

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    userType: 'TRAINER',
    nickname: '',
    phone: '',
    agreedToTerms: false,
    agreedToPrivacy: false,
    agreedToMarketing: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 1) {
      // 1단계: 기본 정보 검증
      if (!formData.email || !formData.password || !formData.name) {
        setError('모든 필수 정보를 입력해주세요.')
        return
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.')
        return
      }
      
      if (formData.password.length < 6) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.')
        return
      }
      
      setError('')
      setStep(2)
      return
    }

    if (step === 2) {
      // 2단계: 회원가입 처리
      if (!formData.agreedToTerms || !formData.agreedToPrivacy) {
        setError('필수 약관에 동의해주세요.')
        return
      }

      setLoading(true)
      setError('')

      try {
        // 1. Supabase Auth 회원가입
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              user_type: formData.userType,
            }
          }
        })

        if (authError) {
          if (authError.message.includes('already registered')) {
            setError('이미 가입된 이메일입니다.')
          } else {
            setError(authError.message)
          }
          return
        }

        if (authData.user) {
          // 2. users 테이블에 추가 정보 저장
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: formData.email,
              name: formData.name,
              role: 'STUDENT', // 기본 역할
              nickname: formData.nickname || null,
              phone: formData.phone || null,
              agreed_to_marketing: formData.agreedToMarketing,
            })

          if (profileError) {
            console.error('Profile creation error:', profileError)
            // Auth 사용자는 생성되었지만 프로필은 실패한 경우
            // 나중에 프로필을 다시 생성할 수 있도록 로그인 페이지로 이동
          }

          // 회원가입 성공
          router.push('/auth/welcome')
        }
      } catch (err) {
        console.error('Signup error:', err)
        setError('회원가입 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-fitness-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            LVUP EDU 회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            피트니스 전문가로 성장하는 첫 걸음
          </p>
        </div>

        {/* 진행 상태 표시 */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {step > 1 ? <CheckIcon className="w-5 h-5" /> : '1'}
          </div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary-500' : 'bg-gray-200'}`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  이메일 주소 *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input mt-1"
                  placeholder="example@lvupedu.com"
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  이름 *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input mt-1"
                  placeholder="홍길동"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  비밀번호 *
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input pr-10"
                    placeholder="최소 6자 이상"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  비밀번호 확인 *
                </label>
                <div className="relative mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input pr-10"
                    placeholder="비밀번호를 다시 입력하세요"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="btn-primary w-full justify-center py-3 text-base"
                >
                  다음 단계
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-3">
                  어떤 분야에 관심이 있으신가요? *
                </label>
                <div className="space-y-3">
                  {userTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`relative flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        formData.userType === type.value ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="userType"
                        value={type.value}
                        checked={formData.userType === type.value}
                        onChange={handleChange}
                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">{type.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                    닉네임
                  </label>
                  <input
                    id="nickname"
                    name="nickname"
                    type="text"
                    value={formData.nickname}
                    onChange={handleChange}
                    className="input mt-1"
                    placeholder="선택사항"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    전화번호
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input mt-1"
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start">
                  <input
                    id="agreedToTerms"
                    name="agreedToTerms"
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agreedToTerms" className="ml-2 text-sm text-gray-900">
                    <span className="text-red-500">*</span> 이용약관에 동의합니다{' '}
                    <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                      [보기]
                    </Link>
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    id="agreedToPrivacy"
                    name="agreedToPrivacy"
                    type="checkbox"
                    checked={formData.agreedToPrivacy}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agreedToPrivacy" className="ml-2 text-sm text-gray-900">
                    <span className="text-red-500">*</span> 개인정보 처리방침에 동의합니다{' '}
                    <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                      [보기]
                    </Link>
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    id="agreedToMarketing"
                    name="agreedToMarketing"
                    type="checkbox"
                    checked={formData.agreedToMarketing}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agreedToMarketing" className="ml-2 text-sm text-gray-900">
                    마케팅 정보 수신에 동의합니다 (선택)
                  </label>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-outline flex-1 justify-center py-3 text-base"
                >
                  이전
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 justify-center py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      가입 중...
                    </div>
                  ) : (
                    '회원가입 완료'
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="text-center">
            <span className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                로그인
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}