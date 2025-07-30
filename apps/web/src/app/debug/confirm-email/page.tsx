'use client';

import { useState } from 'react';

export default function ConfirmEmailPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const disableEmailConfirmation = async () => {
    setLoading(true);
    setResult('이메일 확인 비활성화 시도 중...');

    try {
      const { getSupabaseClient } = await import('@/lib/supabase');
      
      let resultText = '📧 이메일 확인 설정 변경:\n\n';
      
      // 현재는 클라이언트에서 직접 설정을 변경할 수 없으므로
      // 대신 수동으로 확인해주는 방법을 제시
      resultText += '⚠️ 클라이언트에서는 직접 설정을 변경할 수 없습니다.\n\n';
      resultText += '🔧 Supabase Dashboard에서 설정 변경:\n';
      resultText += '1. https://supabase.com/dashboard 접속\n';
      resultText += '2. 프로젝트 선택: lhbbnkhytojlvefzcdca\n';
      resultText += '3. Authentication > Settings 이동\n';
      resultText += '4. "Enable email confirmations" 체크 해제\n';
      resultText += '5. Save 클릭\n\n';
      resultText += '✅ 설정 후 즉시 로그인 가능해집니다!\n';

      setResult(resultText);

    } catch (error) {
      console.error('Email confirmation disable error:', error);
      setResult(`❌ 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const forceConfirmAccount = async () => {
    setLoading(true);
    setResult('계정 강제 확인 시도 중...');

    try {
      const { getSupabaseClient } = await import('@/lib/supabase');
      const client = getSupabaseClient();
      
      if (!client) {
        setResult('❌ Supabase 클라이언트 초기화 실패');
        return;
      }

      let resultText = '🔓 테스트 계정 강제 확인:\n\n';

      // Admin API를 통한 사용자 확인 (관리자 권한 필요)
      try {
        // 이 방법은 서버사이드에서만 가능하므로 클라이언트에서는 동작하지 않음
        // 대신 다른 접근 방법 제시
        resultText += '⚠️ 클라이언트에서는 직접 계정 확인이 불가능합니다.\n\n';
        
        // 대신 새로운 테스트 계정 생성 제안
        resultText += '🆕 해결책: 새로운 테스트 계정 생성\n';
        resultText += '이메일 확인이 비활성화된 후에는 새로운 계정이\n';
        resultText += '자동으로 확인된 상태로 생성됩니다.\n\n';
        
        resultText += '📝 권장 순서:\n';
        resultText += '1. Supabase에서 이메일 확인 비활성화\n';
        resultText += '2. 새로운 Gmail 계정으로 회원가입 테스트\n';
        resultText += '3. 바로 로그인 가능 확인\n';

      } catch (adminError) {
        resultText += `❌ Admin 작업 실패: ${adminError instanceof Error ? adminError.message : '알 수 없는 오류'}\n`;
      }

      setResult(resultText);

    } catch (error) {
      console.error('Force confirm error:', error);
      setResult(`❌ 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const testWithNewAccount = async () => {
    setLoading(true);
    setResult('새로운 테스트 계정 생성 중...');

    try {
      const { getSupabaseClient } = await import('@/lib/supabase');
      const client = getSupabaseClient();
      
      if (!client) {
        setResult('❌ Supabase 클라이언트 초기화 실패');
        return;
      }

      // 새로운 랜덤 이메일 생성
      const randomNum = Math.floor(Math.random() * 10000);
      const newEmail = `lvuptest${randomNum}@gmail.com`;
      const password = 'test123456';

      let resultText = '🆕 새로운 테스트 계정 생성:\n\n';
      resultText += `테스트 데이터:\n`;
      resultText += `  이메일: ${newEmail}\n`;
      resultText += `  비밀번호: ${password}\n\n`;

      try {
        const { data, error } = await client.auth.signUp({
          email: newEmail,
          password: password,
          options: {
            data: {
              name: '이메일 테스트',
              user_type: 'TRAINER'
            }
          }
        });

        if (error) {
          resultText += `❌ 계정 생성 실패: ${error.message}\n`;
        } else if (data?.user) {
          resultText += `✅ 계정 생성 성공!\n`;
          resultText += `   User ID: ${data.user.id}\n`;
          resultText += `   Email Confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}\n\n`;
          
          if (!data.user.email_confirmed_at) {
            resultText += `⚠️ 여전히 이메일 확인이 필요합니다.\n`;
            resultText += `이는 Supabase에서 이메일 확인이 활성화되어 있기 때문입니다.\n\n`;
            resultText += `💡 해결책: Supabase Dashboard에서 이메일 확인을 비활성화하세요.\n`;
          } else {
            resultText += `🎉 이메일 확인이 자동으로 완료되었습니다!\n`;
            resultText += `이제 바로 로그인할 수 있습니다.\n\n`;
            resultText += `🔗 로그인 테스트: https://lvup-edu-web-h1ln-psi.vercel.app/auth/login\n`;
          }
        }

      } catch (signupError) {
        resultText += `❌ 회원가입 오류: ${signupError instanceof Error ? signupError.message : '알 수 없는 오류'}\n`;
      }

      setResult(resultText);

    } catch (error) {
      console.error('New account test error:', error);
      setResult(`❌ 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 py-12 px-4'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-900 mb-8'>
          📧 이메일 확인 문제 해결
        </h1>

        <div className='bg-red-50 border border-red-200 rounded-lg p-6 mb-6'>
          <h3 className='text-lg font-semibold text-red-800 mb-2'>
            🚨 발견된 문제
          </h3>
          <p className='text-red-700'>
            <strong>"Email not confirmed"</strong> 오류로 인해 로그인이 차단되고 있습니다.
            <br />
            Supabase에서 이메일 확인이 활성화되어 있어 로그인 전에 이메일 확인이 필요합니다.
          </p>
        </div>

        <div className='bg-white rounded-lg shadow mb-6'>
          <div className='px-6 py-4 border-b'>
            <h2 className='text-xl font-semibold'>🔧 자동 해결 도구</h2>
            <p className='text-sm text-gray-600 mt-1'>
              아래 버튼들을 순서대로 시도해보세요
            </p>
          </div>
          
          <div className='p-6 space-y-4'>
            <button
              onClick={disableEmailConfirmation}
              disabled={loading}
              className='w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:opacity-50'
            >
              {loading ? '처리 중...' : '1. 📋 이메일 확인 비활성화 방법 안내'}
            </button>

            <button
              onClick={testWithNewAccount}
              disabled={loading}
              className='w-full bg-green-600 text-white py-3 px-4 rounded hover:bg-green-700 disabled:opacity-50'
            >
              {loading ? '생성 중...' : '2. 🆕 새로운 테스트 계정 생성'}
            </button>

            <button
              onClick={forceConfirmAccount}
              disabled={loading}
              className='w-full bg-yellow-600 text-white py-3 px-4 rounded hover:bg-yellow-700 disabled:opacity-50'
            >
              {loading ? '처리 중...' : '3. 🔓 기존 계정 강제 확인 (고급)'}
            </button>
          </div>
        </div>

        {result && (
          <div className='bg-white rounded-lg shadow p-6 mb-6'>
            <h3 className='text-lg font-semibold mb-4'>해결 결과</h3>
            <pre className='whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded overflow-auto'>
              {result}
            </pre>
          </div>
        )}

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-blue-800 mb-2'>
            ✅ 권장 해결 순서
          </h3>
          <ol className='list-decimal list-inside text-blue-700 space-y-2'>
            <li><strong>가장 빠른 해결책:</strong> Supabase Dashboard에서 이메일 확인 비활성화</li>
            <li><strong>즉시 테스트:</strong> 새로운 테스트 계정으로 로그인 확인</li>
            <li><strong>실제 사용:</strong> 기존 사용자들도 바로 로그인 가능</li>
            <li><strong>최종 확인:</strong> 실제 회원가입 페이지에서 테스트</li>
          </ol>
        </div>
      </div>
    </div>
  );
}