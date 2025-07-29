'use client';

import { useState } from 'react';

export default function SupabaseDebugPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testSupabaseConnection = async () => {
    setLoading(true);
    setResult('Supabase 연결 테스트 중...');

    try {
      const { getSupabaseClient, isSupabaseReady, safeSupabaseOperation } =
        await import('@/lib/supabase');

      if (!isSupabaseReady()) {
        setResult('❌ Supabase 클라이언트 초기화 실패');
        return;
      }

      // 1. 기본 연결 테스트
      const connectionTest = await safeSupabaseOperation(async client => {
        // 간단한 테이블 존재 확인 (users 테이블)
        const { data, error } = await client
          .from('users')
          .select('count')
          .limit(1);

        return { data, error };
      });

      let resultText = '🔍 Supabase 연결 진단 결과:\n\n';

      if (connectionTest === null) {
        resultText += '❌ safeSupabaseOperation 실패\n';
      } else if (connectionTest.error) {
        resultText += `❌ Database 연결 실패:\n`;
        resultText += `   Error: ${connectionTest.error.message}\n`;
        resultText += `   Code: ${connectionTest.error.code}\n`;
        resultText += `   Details: ${connectionTest.error.details}\n`;
        resultText += `   Hint: ${connectionTest.error.hint}\n\n`;

        // RLS 정책 확인 제안
        if (connectionTest.error.message.includes('policy')) {
          resultText += '💡 users 테이블의 RLS 정책을 확인해주세요.\n';
          resultText += '   Supabase Dashboard → Authentication → Policies\n\n';
        }
      } else {
        resultText += '✅ Database 연결 성공\n';
        resultText += `   Users 테이블 접근 가능\n\n`;
      }

      // 2. Auth 설정 확인
      const authTest = await safeSupabaseOperation(async client => {
        // 현재 세션 확인
        const {
          data: { session },
          error,
        } = await client.auth.getSession();
        return { session, error };
      });

      if (authTest) {
        resultText += '✅ Auth 서비스 정상\n';
        resultText += `   현재 세션: ${authTest.session ? 'Active' : 'None'}\n\n`;
      } else {
        resultText += '❌ Auth 서비스 연결 실패\n\n';
      }

      // 3. 회원가입 테스트 (실제로는 하지 않고 검증만)
      resultText += '📋 회원가입 요구사항 검증:\n';

      const testEmail = 'test@example.com';
      const testPassword = 'test123456';

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      resultText += `   이메일 형식 (${testEmail}): ${emailRegex.test(testEmail) ? '✅' : '❌'}\n`;

      // 비밀번호 길이 검증
      resultText += `   비밀번호 길이 (${testPassword.length}자): ${testPassword.length >= 6 ? '✅' : '❌'}\n\n`;

      // 4. 프로젝트 정보 (URL에서 추출)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        const projectMatch = supabaseUrl.match(
          /https:\/\/([^.]+)\.supabase\.co/
        );
        if (projectMatch) {
          resultText += `🏗️ 프로젝트 정보:\n`;
          resultText += `   Project ID: ${projectMatch[1]}\n`;
          resultText += `   Region: ${supabaseUrl.includes('supabase.co') ? 'Default' : 'Custom'}\n\n`;
        }
      }

      setResult(resultText);
    } catch (error) {
      console.error('Supabase debug error:', error);
      setResult(
        `❌ 진단 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const testSignUpProcess = async () => {
    setLoading(true);
    setResult('회원가입 프로세스 테스트 중...');

    try {
      const { getSupabaseClient, isSupabaseReady, safeSupabaseOperation } =
        await import('@/lib/supabase');

      if (!isSupabaseReady()) {
        setResult('❌ Supabase 클라이언트 초기화 실패');
        return;
      }

      const testData = {
        email: 'testuser12345@naver.com',
        password: 'debugtest123',
        name: '디버그 테스트',
        userType: 'TRAINER',
      };

      let resultText = '🧪 회원가입 프로세스 테스트:\n\n';
      resultText += `테스트 데이터:\n`;
      resultText += `  이메일: ${testData.email}\n`;
      resultText += `  비밀번호 길이: ${testData.password.length}자\n`;
      resultText += `  이름: ${testData.name}\n`;
      resultText += `  타입: ${testData.userType}\n\n`;

      // Step 1: Supabase 프로젝트 정보 먼저 확인
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      resultText += '🔧 Supabase 프로젝트 설정 확인:\n';
      resultText += `  URL: ${supabaseUrl ? '✅ 존재' : '❌ 없음'}\n`;
      resultText += `  Key: ${supabaseKey ? '✅ 존재' : '❌ 없음'}\n`;
      
      if (supabaseUrl) {
        const projectMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
        if (projectMatch) {
          resultText += `  Project ID: ${projectMatch[1]}\n`;
        }
      }
      resultText += '\n';

      // Step 2: Auth 설정 상태 확인
      resultText += '🔍 Auth 설정 상태 확인:\n';
      const authStatusResult = await safeSupabaseOperation(async client => {
        // Auth 설정 정보 확인
        const { data: { session }, error } = await client.auth.getSession();
        return { session, error };
      });
      
      if (authStatusResult) {
        resultText += `  세션 상태: ${authStatusResult.session ? 'Active' : 'None'}\n`;
        resultText += `  Auth 서비스: ✅ 정상\n`;
      } else {
        resultText += `  Auth 서비스: ❌ 연결 실패\n`;
      }
      resultText += '\n';

      // Step 3: Auth signup 시도  
      resultText += '⚡ Auth 회원가입 시도...\n';

      const signUpResult = await safeSupabaseOperation(async client => {
        const { data, error } = await client.auth.signUp({
          email: testData.email,
          password: testData.password,
          options: {
            data: {
              name: testData.name,
              user_type: testData.userType,
            },
          },
        });

        return { data, error };
      });

      if (signUpResult?.error) {
        resultText += `❌ Auth 회원가입 실패:\n`;
        resultText += `   Error: ${signUpResult.error.message}\n`;
        resultText += `   Code: ${signUpResult.error.status}\n\n`;

        if (signUpResult.error.message.includes('already registered')) {
          resultText += '💡 이미 존재하는 계정입니다. (정상적인 경우)\n';
        } else if (signUpResult.error.message.includes('Invalid email')) {
          resultText += '💡 이메일 형식이 잘못되었습니다.\n';
        } else if (signUpResult.error.message.includes('Password')) {
          resultText += '💡 비밀번호 요구사항을 확인해주세요.\n';
        }
      } else if (signUpResult?.data?.user) {
        resultText += `✅ Auth 회원가입 성공!\n`;
        resultText += `   User ID: ${signUpResult.data.user.id}\n`;
        resultText += `   Email: ${signUpResult.data.user.email}\n`;
        resultText += `   Confirmed: ${signUpResult.data.user.email_confirmed_at ? 'Yes' : 'No'}\n\n`;

        // Step 2: users 테이블 INSERT 시도
        resultText += '2단계: users 테이블 프로필 생성 시도...\n';

        const profileResult = await safeSupabaseOperation(async client => {
          const { error } = await client.from('users').insert({
            id: signUpResult.data.user.id,
            email: testData.email,
            name: testData.name,
            role: 'STUDENT',
            user_type: testData.userType,
          });

          return { error };
        });

        if (profileResult?.error) {
          resultText += `❌ 프로필 생성 실패:\n`;
          resultText += `   Error: ${profileResult.error.message}\n`;
          resultText += `   Code: ${profileResult.error.code}\n`;
          resultText += `   Details: ${profileResult.error.details}\n\n`;
        } else {
          resultText += `✅ 프로필 생성 성공!\n\n`;
        }
      } else {
        resultText += `❌ 알 수 없는 오류 - 데이터가 반환되지 않음\n\n`;
      }

      setResult(resultText);
    } catch (error) {
      console.error('SignUp test error:', error);
      setResult(
        `❌ 테스트 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 py-12 px-4'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-900 mb-8'>
          Supabase 상세 진단
        </h1>

        <div className='bg-white rounded-lg shadow p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>진단 도구</h2>
          <div className='space-y-4'>
            <button
              onClick={testSupabaseConnection}
              disabled={loading}
              className='w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50'
            >
              {loading ? '진단 중...' : '1. Supabase 연결 상태 진단'}
            </button>

            <button
              onClick={testSignUpProcess}
              disabled={loading}
              className='w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50'
            >
              {loading ? '테스트 중...' : '2. 회원가입 프로세스 테스트'}
            </button>
          </div>
        </div>

        {result && (
          <div className='bg-white rounded-lg shadow p-6'>
            <h3 className='text-lg font-semibold mb-4'>진단 결과</h3>
            <pre className='whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded overflow-auto'>
              {result}
            </pre>
          </div>
        )}

        <div className='mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-blue-800 mb-2'>
            🔧 사용 방법
          </h3>
          <ol className='list-decimal list-inside text-blue-700 space-y-1'>
            <li>먼저 "Supabase 연결 상태 진단" 클릭</li>
            <li>연결이 정상이면 "회원가입 프로세스 테스트" 클릭</li>
            <li>각 단계의 상세한 결과를 확인</li>
            <li>오류가 있으면 구체적인 해결 방법 제시</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
