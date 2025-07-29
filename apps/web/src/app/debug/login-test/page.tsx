'use client';

import { useState } from 'react';

export default function LoginTestPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState({
    email: 'lvuptest2024@gmail.com',
    password: 'debugtest123'
  });

  const testLogin = async () => {
    setLoading(true);
    setResult('로그인 테스트 중...');

    try {
      const { getSupabaseClient, isSupabaseReady, safeSupabaseOperation, getSupabaseError } = 
        await import('@/lib/supabase');

      let resultText = '🔐 로그인 프로세스 테스트:\n\n';
      resultText += `테스트 데이터:\n`;
      resultText += `  이메일: ${testData.email}\n`;
      resultText += `  비밀번호 길이: ${testData.password.length}자\n\n`;

      // Step 1: Supabase 준비 상태 확인
      resultText += '1단계: Supabase 클라이언트 상태 확인...\n';
      
      if (!isSupabaseReady()) {
        const supabaseError = getSupabaseError();
        resultText += `❌ Supabase 클라이언트 초기화 실패\n`;
        resultText += `   Error: ${supabaseError?.message || '알 수 없는 오류'}\n\n`;
        setResult(resultText);
        return;
      } else {
        resultText += `✅ Supabase 클라이언트 준비 완료\n\n`;
      }

      // Step 2: 기존 세션 확인
      resultText += '2단계: 기존 세션 상태 확인...\n';
      
      const sessionCheck = await safeSupabaseOperation(async (client) => {
        const { data: { session }, error } = await client.auth.getSession();
        return { session, error };
      });

      if (sessionCheck?.session) {
        resultText += `✅ 기존 세션 존재: ${sessionCheck.session.user.email}\n`;
        resultText += `   세션 만료: ${new Date(sessionCheck.session.expires_at!).toLocaleString()}\n\n`;
      } else {
        resultText += `📝 기존 세션 없음 (정상)\n\n`;
      }

      // Step 3: 로그인 시도 (직접 클라이언트 사용으로 변경)
      resultText += '3단계: 로그인 시도...\n';
      
      const client = getSupabaseClient();
      if (!client) {
        resultText += `❌ Supabase 클라이언트를 가져올 수 없습니다.\n\n`;
        setResult(resultText);
        return;
      }

      let loginResult;
      try {
        console.log('Attempting login with:', {
          email: testData.email,
          passwordLength: testData.password.length
        });

        const { data, error } = await client.auth.signInWithPassword({
          email: testData.email,
          password: testData.password,
        });

        console.log('Login response:', {
          hasData: !!data,
          hasUser: !!data?.user,
          hasSession: !!data?.session,
          userEmail: data?.user?.email,
          error: error,
          errorMessage: error?.message,
          errorStatus: error?.status
        });

        if (error) {
          console.error('Login error details:', error);
          resultText += `❌ 로그인 실패:\n`;
          resultText += `   Error: ${error.message}\n`;
          resultText += `   Status: ${error.status}\n`;
          resultText += `   Code: ${error.code || 'N/A'}\n\n`;
          
          // 일반적인 오류 해결 제안
          if (error.message.includes('Invalid login credentials')) {
            resultText += `💡 해결 방법:\n`;
            resultText += `   - 이메일/비밀번호가 정확한지 확인\n`;
            resultText += `   - 계정이 존재하는지 확인\n`;
            resultText += `   - 이메일 확인이 필요한지 확인\n\n`;
          } else if (error.message.includes('Email not confirmed')) {
            resultText += `💡 해결 방법:\n`;
            resultText += `   - 이메일 확인 링크를 클릭하세요\n`;
            resultText += `   - 또는 Supabase에서 이메일 확인 비활성화\n\n`;
          }
          
          setResult(resultText);
          return;
        }

        loginResult = data;
      } catch (directError) {
        console.error('Direct login error:', directError);
        resultText += `❌ 직접 로그인 시도 실패:\n`;
        resultText += `   Error: ${directError instanceof Error ? directError.message : '알 수 없는 오류'}\n`;
        resultText += `   Stack: ${directError instanceof Error ? directError.stack : 'N/A'}\n\n`;
        setResult(resultText);
        return;
      }

      if (!loginResult) {
        resultText += `❌ 로그인 결과가 비어있습니다\n`;
        resultText += `   예상치 못한 응답입니다.\n\n`;
      } else if (loginResult?.user) {
        resultText += `✅ 로그인 성공!\n`;
        resultText += `   User ID: ${loginResult.user.id}\n`;
        resultText += `   Email: ${loginResult.user.email}\n`;
        resultText += `   Confirmed: ${loginResult.user.email_confirmed_at ? 'Yes' : 'No'}\n`;
        resultText += `   Session: ${loginResult.session ? 'Active' : 'None'}\n\n`;

        // Step 4: 사용자 프로필 확인
        resultText += '4단계: 사용자 프로필 확인...\n';
        
        const profileResult = await safeSupabaseOperation(async (client) => {
          const { data, error } = await client
            .from('users')
            .select('*')
            .eq('id', loginResult.user.id)
            .single();
          
          return { data, error };
        });

        if (profileResult?.error) {
          resultText += `⚠️ 프로필 조회 실패: ${profileResult.error.message}\n`;
          resultText += `   Code: ${profileResult.error.code}\n`;
        } else if (profileResult?.data) {
          resultText += `✅ 프로필 존재\n`;
          resultText += `   Name: ${profileResult.data.name}\n`;
          resultText += `   Role: ${profileResult.data.role}\n`;
          resultText += `   Type: ${profileResult.data.user_type}\n`;
        } else {
          resultText += `❌ 프로필 없음\n`;
        }
      } else {
        resultText += `❌ 로그인 실패 - 사용자 정보 반환되지 않음\n`;
      }

      setResult(resultText);

    } catch (error) {
      console.error('Login test error:', error);
      let errorText = '❌ 로그인 테스트 중 오류 발생:\n\n';
      
      if (error instanceof Error) {
        errorText += `Error: ${error.message}\n`;
        errorText += `Stack: ${error.stack}\n`;
      } else {
        errorText += `Unknown error: ${JSON.stringify(error)}\n`;
      }
      
      setResult(errorText);
    } finally {
      setLoading(false);
    }
  };

  const createTestAccount = async () => {
    setLoading(true);
    setResult('테스트 계정 생성 중...');

    try {
      const { safeSupabaseOperation } = await import('@/lib/supabase');

      const signUpResult = await safeSupabaseOperation(async (client) => {
        const { data, error } = await client.auth.signUp({
          email: testData.email,
          password: testData.password,
          options: {
            data: {
              name: '로그인 테스트',
              user_type: 'TRAINER'
            }
          }
        });

        if (error && !error.message.includes('already registered')) {
          throw error;
        }

        return { data, error };
      });

      if (signUpResult?.error?.message.includes('already registered')) {
        setResult(`✅ 테스트 계정이 이미 존재합니다.\n이메일: ${testData.email}\n비밀번호: ${testData.password}`);
      } else if (signUpResult?.data?.user) {
        setResult(`✅ 테스트 계정 생성 완료!\n이메일: ${testData.email}\n비밀번호: ${testData.password}\n\n이제 로그인 테스트를 해보세요.`);
      } else {
        setResult('❌ 계정 생성 실패');
      }

    } catch (error) {
      console.error('Account creation error:', error);
      setResult(`❌ 계정 생성 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 py-12 px-4'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-900 mb-8'>
          🔐 로그인 기능 진단
        </h1>

        <div className='bg-white rounded-lg shadow p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>테스트 계정 정보</h2>
          <div className='grid grid-cols-2 gap-4 mb-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                이메일
              </label>
              <input
                type='email'
                value={testData.email}
                onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                비밀번호
              </label>
              <input
                type='password'
                value={testData.password}
                onChange={(e) => setTestData(prev => ({ ...prev, password: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-300 rounded-md'
              />
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>진단 도구</h2>
          <div className='space-y-4'>
            <button
              onClick={createTestAccount}
              disabled={loading}
              className='w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50'
            >
              {loading ? '처리 중...' : '1. 테스트 계정 생성/확인'}
            </button>
            
            <button
              onClick={testLogin}
              disabled={loading}
              className='w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50'
            >
              {loading ? '테스트 중...' : '2. 로그인 기능 테스트'}
            </button>
          </div>
        </div>

        {result && (
          <div className='bg-white rounded-lg shadow p-6'>
            <h3 className='text-lg font-semibold mb-4'>테스트 결과</h3>
            <pre className='whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded overflow-auto'>
              {result}
            </pre>
          </div>
        )}

        <div className='mt-8 bg-red-50 border border-red-200 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-red-800 mb-2'>
            🚨 로그인 오류 해결 단계
          </h3>
          <ol className='list-decimal list-inside text-red-700 space-y-1'>
            <li>먼저 "테스트 계정 생성/확인" 클릭</li>
            <li>"로그인 기능 테스트" 클릭하여 상세 오류 확인</li>
            <li>결과에 따라 문제점 파악 및 해결</li>
            <li>실제 로그인 페이지에서 재테스트</li>
          </ol>
        </div>
      </div>
    </div>
  );
}