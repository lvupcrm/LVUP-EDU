'use client'

import { useState } from 'react'

export default function TestAuthPage() {
  const [testResult, setTestResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testAccount = {
    email: 'test@gmail.com',
    password: 'test123456',
    name: '테스트 사용자'
  }

  const testSignup = async () => {
    setLoading(true)
    setTestResult('테스트 계정 생성 중...')
    
    try {
      const { getSupabaseClient, isSupabaseReady, safeSupabaseOperation } = await import('@/lib/supabase')
      
      if (!isSupabaseReady()) {
        setTestResult('❌ Supabase 연결 실패')
        return
      }

      const result = await safeSupabaseOperation(async (client) => {
        // 1. 기존 계정 확인
        const { data: existingUser } = await client.auth.signInWithPassword({
          email: testAccount.email,
          password: testAccount.password
        })

        if (existingUser?.user) {
          return { type: 'existing', user: existingUser.user }
        }

        // 2. 새 계정 생성
        console.log('Creating new test account...');
        const { data: newUser, error } = await client.auth.signUp({
          email: testAccount.email,
          password: testAccount.password,
          options: {
            data: {
              name: testAccount.name,
              user_type: 'TRAINER'
            }
          }
        })

        console.log('SignUp result:', { data: newUser, error });

        if (error) {
          console.error('SignUp error details:', error);
          throw new Error(`SignUp failed: ${error.message} (Code: ${error.status})`);
        }

        return { type: 'new', user: newUser.user }
      })

      if (result) {
        if (result.type === 'existing') {
          setTestResult(`✅ 기존 테스트 계정 확인됨\n이메일: ${testAccount.email}\n비밀번호: ${testAccount.password}`)
        } else {
          setTestResult(`✅ 새 테스트 계정 생성됨\n이메일: ${testAccount.email}\n비밀번호: ${testAccount.password}\n\n⚠️ 이메일 확인이 필요할 수 있습니다.`)
        }
      } else {
        setTestResult('❌ 계정 생성 실패')
      }
    } catch (error) {
      console.error('Test signup error:', error)
      setTestResult(`❌ 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    setTestResult('테스트 로그인 중...')
    
    try {
      const { getSupabaseClient, isSupabaseReady, safeSupabaseOperation } = await import('@/lib/supabase')
      
      if (!isSupabaseReady()) {
        setTestResult('❌ Supabase 연결 실패')
        return
      }

      const result = await safeSupabaseOperation(async (client) => {
        const { data, error } = await client.auth.signInWithPassword({
          email: testAccount.email,
          password: testAccount.password
        })

        console.log('Test login result:', { data, error })

        if (error) {
          throw error
        }

        return data
      })

      if (result?.user) {
        setTestResult(`✅ 테스트 로그인 성공!\n사용자 ID: ${result.user.id}\n이메일: ${result.user.email}\n확인됨: ${result.user.email_confirmed_at ? 'Yes' : 'No'}`)
      } else {
        setTestResult('❌ 로그인 실패 - 사용자 정보 없음')
      }
    } catch (error) {
      console.error('Test login error:', error)
      setTestResult(`❌ 로그인 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">인증 테스트</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">테스트 계정 정보</h2>
          <div className="bg-gray-50 p-4 rounded">
            <p><strong>이메일:</strong> {testAccount.email}</p>
            <p><strong>비밀번호:</strong> {testAccount.password}</p>
            <p><strong>이름:</strong> {testAccount.name}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">테스트 기능</h2>
          <div className="space-y-4">
            <button
              onClick={testSignup}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '처리 중...' : '1. 테스트 계정 생성/확인'}
            </button>
            
            <button
              onClick={testLogin}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? '처리 중...' : '2. 테스트 로그인'}
            </button>
          </div>
        </div>

        {testResult && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">결과</h3>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded">
              {testResult}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            🔧 디버깅 단계
          </h3>
          <ol className="list-decimal list-inside text-yellow-700 space-y-1">
            <li>먼저 "테스트 계정 생성/확인" 버튼 클릭</li>
            <li>그 다음 "테스트 로그인" 버튼 클릭</li>
            <li>각 단계의 결과를 확인</li>
            <li>실제 로그인 페이지에서 테스트 계정으로 로그인 시도</li>
          </ol>
        </div>
      </div>
    </div>
  )
}