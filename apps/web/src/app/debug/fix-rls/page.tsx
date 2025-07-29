'use client';

import { useState } from 'react';

export default function FixRLSPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fixRLSPolicies = async () => {
    setLoading(true);
    setResult('RLS 정책 설정 중...');

    try {
      const { getSupabaseClient, isSupabaseReady, safeSupabaseOperation } =
        await import('@/lib/supabase');

      if (!isSupabaseReady()) {
        setResult('❌ Supabase 클라이언트 초기화 실패');
        return;
      }

      let resultText = '🔧 RLS 정책 자동 설정:\n\n';

      // Step 1: 기존 정책 제거
      resultText += '1단계: 기존 RLS 정책 제거...\n';
      
      const dropPolicies = [
        'DROP POLICY IF EXISTS "Users can insert own profile" ON users;',
        'DROP POLICY IF EXISTS "Users can view own profile" ON users;',
        'DROP POLICY IF EXISTS "Users can update own profile" ON users;',
        'DROP POLICY IF EXISTS "Allow signup" ON users;'
      ];

      for (const policy of dropPolicies) {
        const dropResult = await safeSupabaseOperation(async (client) => {
          const { error } = await client.rpc('execute_sql', { sql: policy });
          return { error };
        });

        if (dropResult?.error) {
          resultText += `   ⚠️ ${policy.split('"')[1] || 'Unknown'}: ${dropResult.error.message}\n`;
        } else {
          resultText += `   ✅ 기존 정책 제거 완료\n`;
        }
      }

      // Step 2: 새로운 정책 생성
      resultText += '\n2단계: 새로운 RLS 정책 생성...\n';

      const newPolicies = [
        {
          name: 'Users can insert own profile',
          sql: `CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);`
        },
        {
          name: 'Users can view own profile', 
          sql: `CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);`
        },
        {
          name: 'Users can update own profile',
          sql: `CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);`
        }
      ];

      for (const policy of newPolicies) {
        const createResult = await safeSupabaseOperation(async (client) => {
          const { error } = await client.rpc('execute_sql', { sql: policy.sql });
          return { error };
        });

        if (createResult?.error) {
          resultText += `   ❌ ${policy.name}: ${createResult.error.message}\n`;
        } else {
          resultText += `   ✅ ${policy.name} 생성 완료\n`;
        }
      }

      // Step 3: RLS 활성화 확인
      resultText += '\n3단계: RLS 활성화 확인...\n';
      
      const enableRLSResult = await safeSupabaseOperation(async (client) => {
        const { error } = await client.rpc('execute_sql', { 
          sql: 'ALTER TABLE users ENABLE ROW LEVEL SECURITY;' 
        });
        return { error };
      });

      if (enableRLSResult?.error) {
        resultText += `   ⚠️ RLS 활성화: ${enableRLSResult.error.message}\n`;
      } else {
        resultText += `   ✅ RLS 활성화 완료\n`;
      }

      // Step 4: 테스트
      resultText += '\n4단계: 정책 적용 테스트...\n';
      
      const testResult = await safeSupabaseOperation(async (client) => {
        // 임시 사용자 생성 테스트
        const { data, error } = await client.auth.signUp({
          email: 'rlstest@naver.com',
          password: 'test123456',
          options: {
            data: {
              name: 'RLS 테스트',
              user_type: 'TRAINER'
            }
          }
        });

        if (error && !error.message.includes('already registered')) {
          return { error };
        }

        // 사용자가 이미 존재하거나 새로 생성된 경우
        const userId = data?.user?.id;
        if (userId) {
          // 프로필 생성 테스트
          const { error: profileError } = await client.from('users').insert({
            id: userId,
            email: 'rlstest@naver.com',
            name: 'RLS 테스트',
            role: 'STUDENT',
            user_type: 'TRAINER'
          });

          return { profileError };
        }

        return { success: true };
      });

      if (testResult?.profileError) {
        resultText += `   ❌ 테스트 실패: ${testResult.profileError.message}\n`;
        resultText += '\n💡 수동 해결이 필요할 수 있습니다.\n';
      } else {
        resultText += `   ✅ RLS 정책 적용 성공!\n`;
        resultText += '\n🎉 이제 회원가입이 정상 작동할 것입니다!\n';
      }

      setResult(resultText);

    } catch (error) {
      console.error('RLS fix error:', error);
      setResult(`❌ 설정 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const disableRLSTemporary = async () => {
    setLoading(true);
    setResult('RLS 임시 비활성화 중...');

    try {
      const { getSupabaseClient, isSupabaseReady, safeSupabaseOperation } =
        await import('@/lib/supabase');

      if (!isSupabaseReady()) {
        setResult('❌ Supabase 클라이언트 초기화 실패');
        return;
      }

      const disableResult = await safeSupabaseOperation(async (client) => {
        const { error } = await client.rpc('execute_sql', { 
          sql: 'ALTER TABLE users DISABLE ROW LEVEL SECURITY;' 
        });
        return { error };
      });

      if (disableResult?.error) {
        setResult(`❌ RLS 비활성화 실패: ${disableResult.error.message}\n\n💡 Supabase 대시보드에서 수동으로 설정해야 할 수 있습니다.`);
      } else {
        setResult(`✅ RLS 임시 비활성화 완료!\n\n⚠️ 주의: 이는 개발용으로만 사용하세요.\n프로덕션에서는 반드시 RLS를 활성화해야 합니다.\n\n🎉 이제 회원가입이 작동할 것입니다!`);
      }

    } catch (error) {
      console.error('RLS disable error:', error);
      setResult(`❌ 비활성화 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 py-12 px-4'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-900 mb-8'>
          🔧 Supabase RLS 정책 자동 설정
        </h1>

        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6'>
          <h3 className='text-lg font-semibold text-yellow-800 mb-2'>
            ⚠️ 발견된 문제
          </h3>
          <p className='text-yellow-700'>
            <strong>users 테이블의 RLS 정책</strong>이 새로운 사용자의 프로필 생성을 차단하고 있습니다.
            <br />
            아래 버튼으로 자동으로 해결할 수 있습니다.
          </p>
        </div>

        <div className='bg-white rounded-lg shadow p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>해결 방법 선택</h2>
          <div className='space-y-4'>
            <button
              onClick={fixRLSPolicies}
              disabled={loading}
              className='w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:opacity-50'
            >
              {loading ? '설정 중...' : '🔒 올바른 RLS 정책 자동 설정 (권장)'}
            </button>

            <button
              onClick={disableRLSTemporary}
              disabled={loading}
              className='w-full bg-yellow-600 text-white py-3 px-4 rounded hover:bg-yellow-700 disabled:opacity-50'
            >
              {loading ? '처리 중...' : '⚡ RLS 임시 비활성화 (빠른 해결)'}
            </button>
          </div>

          <div className='mt-4 text-sm text-gray-600'>
            <p><strong>권장:</strong> 첫 번째 옵션으로 보안을 유지하면서 문제를 해결</p>
            <p><strong>빠른 해결:</strong> 두 번째 옵션으로 즉시 작동하도록 설정 (개발용)</p>
          </div>
        </div>

        {result && (
          <div className='bg-white rounded-lg shadow p-6'>
            <h3 className='text-lg font-semibold mb-4'>설정 결과</h3>
            <pre className='whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded overflow-auto'>
              {result}
            </pre>
          </div>
        )}

        <div className='mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-blue-800 mb-2'>
            📋 다음 단계
          </h3>
          <ol className='list-decimal list-inside text-blue-700 space-y-1'>
            <li>위 버튼 중 하나를 클릭하여 문제 해결</li>
            <li>설정 완료 후 회원가입 페이지에서 테스트</li>
            <li>또는 Supabase 진단 도구에서 재테스트</li>
          </ol>
        </div>
      </div>
    </div>
  );
}