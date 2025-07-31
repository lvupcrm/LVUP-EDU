'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { CheckCircleIcon, XCircleIcon, PlayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface VerificationResult {
  total_auth_users: number;
  total_public_users: number;
  missing_profiles: number;
  sync_percentage: number;
  status: string;
}

interface TriggerTestResult {
  success: boolean;
  message: string;
  details?: any;
}

export default function AuthFixVerificationPage() {
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [triggerTest, setTriggerTest] = useState<TriggerTestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runVerification = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
      }

      // 동기화 상태 확인
      const { data, error } = await supabase.rpc('verify_auth_sync');
      
      if (error) {
        throw new Error(`동기화 상태 확인 실패: ${error.message}`);
      }

      if (data && data.length > 0) {
        setVerification(data[0]);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : '검증 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const testTrigger = async () => {
    setLoading(true);
    setError(null);
    setTriggerTest(null);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
      }

      // 테스트용 이메일 (기존 사용자가 아닌지 확인)
      const testEmail = `test-trigger-${Date.now()}@lvupedu-test.com`;
      const testPassword = 'test123456789';

      console.log('Testing trigger with:', { email: testEmail });

      // 1. 회원가입 시도
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: 'Trigger Test User',
            user_type: 'TRAINER'
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setTriggerTest({
            success: false,
            message: '이미 존재하는 이메일입니다. 다른 이메일로 테스트하세요.'
          });
          return;
        }
        throw new Error(`회원가입 실패: ${signUpError.message}`);
      }

      if (!signUpData.user) {
        throw new Error('사용자 데이터가 생성되지 않았습니다.');
      }

      // 2. 잠시 대기 (트리거 실행 시간 확보)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. public.users 테이블에 프로필이 생성되었는지 확인
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('id, email, name, role, user_type, created_at')
        .eq('id', signUpData.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile check error:', profileError);
      }

      // 4. 테스트 계정 정리 (auth.users에서 삭제)
      try {
        await supabase.auth.admin.deleteUser(signUpData.user.id);
      } catch (deleteError) {
        console.warn('Failed to delete test user:', deleteError);
      }

      // 5. 결과 분석
      if (profileData) {
        setTriggerTest({
          success: true,
          message: '✅ 트리거가 정상적으로 작동합니다!',
          details: {
            userId: signUpData.user.id,
            email: signUpData.user.email,
            profileCreated: true,
            profileData: profileData
          }
        });
      } else {
        setTriggerTest({
          success: false,
          message: '❌ 트리거가 작동하지 않습니다. auth.users에는 생성되었지만 public.users에 프로필이 생성되지 않았습니다.',
          details: {
            userId: signUpData.user.id,
            email: signUpData.user.email,
            profileCreated: false
          }
        });
      }

    } catch (err) {
      console.error('Trigger test error:', err);
      setTriggerTest({
        success: false,
        message: err instanceof Error ? err.message : '트리거 테스트 중 오류가 발생했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  const fixMissingProfiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
      }

      // 누락된 프로필 생성 함수 실행
      const { data, error } = await supabase.rpc('create_missing_user_profiles');
      
      if (error) {
        throw new Error(`프로필 생성 실패: ${error.message}`);
      }

      // 결과 표시
      alert(`${data[0]?.created_count || 0}개의 누락된 프로필이 생성되었습니다.`);
      
      // 검증 다시 실행
      await runVerification();

    } catch (err) {
      console.error('Fix profiles error:', err);
      setError(err instanceof Error ? err.message : '프로필 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SYNCED':
        return 'text-green-600 bg-green-50';
      case 'MOSTLY_SYNCED':
        return 'text-yellow-600 bg-yellow-50';
      case 'OUT_OF_SYNC':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SYNCED':
        return '완전 동기화';
      case 'MOSTLY_SYNCED':
        return '대부분 동기화';
      case 'OUT_OF_SYNC':
        return '동기화 필요';
      default:
        return '알 수 없음';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔧 인증 시스템 수정 검증 도구
            </h1>
            <p className="text-gray-600">
              auth.users와 public.users 동기화 문제 수정 후 검증을 진행합니다.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* 동기화 상태 확인 */}
          <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                1. 현재 동기화 상태 확인
              </h2>
              <button
                onClick={runVerification}
                disabled={loading}
                className="btn-primary flex items-center"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                상태 확인
              </button>
            </div>

            {verification && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {verification.total_auth_users}
                  </div>
                  <div className="text-sm text-gray-600">auth.users</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {verification.total_public_users}
                  </div>
                  <div className="text-sm text-gray-600">public.users</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {verification.missing_profiles}
                  </div>
                  <div className="text-sm text-gray-600">누락된 프로필</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {verification.sync_percentage}%
                  </div>
                  <div className="text-sm text-gray-600">동기화율</div>
                </div>
              </div>
            )}

            {verification && (
              <div className={`flex items-center justify-center p-4 rounded-lg ${getStatusColor(verification.status)}`}>
                {verification.status === 'SYNCED' ? (
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                ) : (
                  <XCircleIcon className="h-5 w-5 mr-2" />
                )}
                <span className="font-medium">
                  상태: {getStatusText(verification.status)}
                </span>
              </div>
            )}

            {verification && verification.missing_profiles > 0 && (
              <div className="mt-4 text-center">
                <button
                  onClick={fixMissingProfiles}
                  disabled={loading}
                  className="btn-primary"
                >
                  누락된 프로필 {verification.missing_profiles}개 생성하기
                </button>
              </div>
            )}
          </div>

          {/* 트리거 동작 테스트 */}
          <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                2. 실시간 트리거 동작 테스트
              </h2>
              <button
                onClick={testTrigger}
                disabled={loading}
                className="btn-primary flex items-center"
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                트리거 테스트
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              새로운 테스트 계정을 생성하여 트리거가 정상적으로 작동하는지 확인합니다.
              테스트 후 계정은 자동으로 삭제됩니다.
            </p>

            {triggerTest && (
              <div className={`p-4 rounded-lg ${triggerTest.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-start">
                  {triggerTest.success ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                  )}
                  <div>
                    <div className={`font-medium ${triggerTest.success ? 'text-green-800' : 'text-red-800'}`}>
                      {triggerTest.message}
                    </div>
                    {triggerTest.details && (
                      <div className="mt-2 text-sm text-gray-600">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(triggerTest.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 사용 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              🔍 사용 안내
            </h3>
            <ol className="list-decimal list-inside text-blue-700 space-y-1">
              <li>먼저 "상태 확인"을 클릭하여 현재 동기화 상태를 확인하세요</li>
              <li>누락된 프로필이 있다면 "누락된 프로필 생성하기"를 클릭하세요</li>
              <li>"트리거 테스트"를 클릭하여 새로운 가입자에 대해 트리거가 정상 작동하는지 확인하세요</li>
              <li>모든 테스트가 성공하면 인증 시스템이 정상적으로 수정된 것입니다</li>
            </ol>
          </div>

          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-3"></div>
                <span>처리 중...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}