'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  CogIcon,
  ShieldExclamationIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

interface TriggerInfo {
  trigger_name: string;
  event_manipulation: string;
  action_timing: string;
  trigger_schema: string;
  trigger_table: string;
  action_statement: string;
  is_enabled: string;
}

interface RLSPolicy {
  schemaname: string;
  tablename: string;
  policyname: string;
  permissive: string;
  roles: string[];
  cmd: string;
  qual: string;
  with_check: string;
}

interface SyncStatus {
  total_auth_users: number;
  total_public_users: number;
  missing_profiles: number;
  sync_percentage: number;
}

export default function TriggerStatusPage() {
  const [triggers, setTriggers] = useState<TriggerInfo[]>([]);
  const [rlsPolicies, setRlsPolicies] = useState<RLSPolicy[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const loadDatabaseStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
      }

      // 1. 트리거 상태 확인
      const { data: triggerData, error: triggerError } = await supabase.rpc('execute_sql', {
        sql: `
          SELECT 
            t.trigger_name,
            t.event_manipulation,
            t.action_timing,
            t.trigger_schema,
            t.trigger_table,
            t.action_statement,
            CASE WHEN t.trigger_name IS NOT NULL THEN 'YES' ELSE 'NO' END as is_enabled
          FROM information_schema.triggers t
          WHERE t.trigger_schema = 'public' 
            AND t.trigger_name LIKE '%auth%'
          ORDER BY t.trigger_name;
        `
      });

      if (triggerError) {
        console.error('Trigger query error:', triggerError);
      } else {
        setTriggers(triggerData || []);
      }

      // 2. RLS 정책 확인
      const { data: rlsData, error: rlsError } = await supabase.rpc('execute_sql', {
        sql: `
          SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies 
          WHERE schemaname = 'public' AND tablename = 'users'
          ORDER BY policyname;
        `
      });

      if (rlsError) {
        console.error('RLS query error:', rlsError);
      } else {
        setRlsPolicies(rlsData || []);
      }

      // 3. 동기화 상태 확인
      const { data: syncData, error: syncError } = await supabase.rpc('check_user_sync_status');
      
      if (syncError) {
        console.error('Sync status error:', syncError);
      } else {
        setSyncStatus(syncData?.[0] || null);
      }
      
    } catch (err) {
      console.error('Database status error:', err);
      setError(err instanceof Error ? err.message : '데이터베이스 상태 확인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const testTrigger = async () => {
    setTestResult('트리거 테스트 실행 중...');
    
    try {
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
      }

      // 테스트 사용자 생성 시도
      const testEmail = `trigger-test-${Date.now()}@test.com`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'testpassword123',
        options: {
          data: {
            full_name: 'Trigger Test User'
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setTestResult('✅ 테스트 완료 - 사용자가 이미 존재합니다. 트리거가 이전에 실행되었을 수 있습니다.');
        } else {
          setTestResult(`❌ Auth 사용자 생성 실패: ${authError.message}`);
        }
        return;
      }

      const userId = authData?.user?.id;
      if (!userId) {
        setTestResult('❌ 사용자 ID를 가져올 수 없습니다.');
        return;
      }

      // 잠시 대기 후 public.users 테이블 확인
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (publicError) {
        if (publicError.code === 'PGRST116') {
          setTestResult(`❌ 트리거 실패 - Auth 사용자는 생성되었지만 public.users에 프로필이 생성되지 않았습니다.
          
사용자 ID: ${userId}
이메일: ${testEmail}

트리거가 작동하지 않는 이유:
1. 트리거가 비활성화되었거나 삭제됨
2. RLS 정책이 트리거 실행을 차단
3. 함수 권한 문제
4. 트리거 함수에 오류가 있음`);
        } else {
          setTestResult(`❌ Public 사용자 조회 오류: ${publicError.message}`);
        }
      } else {
        setTestResult(`✅ 트리거 성공! 
        
Auth 사용자와 Public 사용자가 모두 생성되었습니다:
- 사용자 ID: ${userId}
- 이메일: ${testEmail}
- 이름: ${publicUser.name}
- 역할: ${publicUser.role}

트리거가 정상적으로 작동하고 있습니다.`);
      }
      
    } catch (err) {
      console.error('Trigger test error:', err);
      setTestResult(`❌ 트리거 테스트 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    }
  };

  const fixMissingProfiles = async () => {
    try {
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
      }

      const { data, error } = await supabase.rpc('create_missing_user_profiles');
      
      if (error) {
        setError(`프로필 생성 실패: ${error.message}`);
        return;
      }

      const result = data?.[0];
      if (result) {
        setTestResult(`✅ 누락된 프로필 생성 완료:
        
생성된 프로필 수: ${result.created_count}
생성된 사용자: ${result.created_users.join(', ')}`);
        
        // 상태 새로고침
        await loadDatabaseStatus();
      }
      
    } catch (err) {
      console.error('Fix profiles error:', err);
      setError(err instanceof Error ? err.message : '프로필 생성 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    loadDatabaseStatus();
  }, []);

  const authTrigger = triggers.find(t => t.trigger_name === 'on_auth_user_created');
  const hasUserInsertPolicy = rlsPolicies.some(p => p.cmd === 'INSERT');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔍 데이터베이스 트리거 진단 도구
            </h1>
            <p className="text-gray-600">
              auth.users 트리거와 RLS 정책 상태를 종합적으로 진단합니다.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* 동기화 상태 개요 */}
          {syncStatus && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-soft p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Auth 사용자</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {syncStatus.total_auth_users}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-soft p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Public 사용자</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {syncStatus.total_public_users}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-soft p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <XCircleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">누락된 프로필</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {syncStatus.missing_profiles}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-soft p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${
                    syncStatus.sync_percentage >= 95 ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    <CogIcon className={`h-6 w-6 ${
                      syncStatus.sync_percentage >= 95 ? 'text-green-600' : 'text-yellow-600'
                    }`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">동기화율</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {syncStatus.sync_percentage}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 트리거 상태 */}
          <div className="bg-white rounded-xl shadow-soft mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CogIcon className="h-5 w-5 mr-2" />
                Auth 트리거 상태
              </h2>
            </div>
            <div className="p-6">
              {authTrigger ? (
                <div className="flex items-start space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-medium text-green-900">트리거 활성화됨</h3>
                    <p className="text-sm text-green-700 mt-1">
                      <strong>이름:</strong> {authTrigger.trigger_name}<br />
                      <strong>테이블:</strong> {authTrigger.trigger_table}<br />
                      <strong>이벤트:</strong> {authTrigger.event_manipulation} {authTrigger.action_timing}<br />
                      <strong>함수:</strong> {authTrigger.action_statement}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <XCircleIcon className="h-6 w-6 text-red-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-medium text-red-900">트리거 없음</h3>
                    <p className="text-sm text-red-700 mt-1">
                      'on_auth_user_created' 트리거가 발견되지 않았습니다. 마이그레이션이 실행되지 않았거나 트리거가 삭제되었을 수 있습니다.
                    </p>
                  </div>
                </div>
              )}

              {triggers.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">모든 Auth 관련 트리거:</h4>
                  <div className="space-y-2">
                    {triggers.map((trigger, index) => (
                      <div key={index} className="text-xs bg-gray-100 p-2 rounded font-mono">
                        {trigger.trigger_name} → {trigger.action_statement}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RLS 정책 상태 */}
          <div className="bg-white rounded-xl shadow-soft mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ShieldExclamationIcon className="h-5 w-5 mr-2" />
                RLS 정책 상태 (users 테이블)
              </h2>
            </div>
            <div className="p-6">
              {rlsPolicies.length > 0 ? (
                <div className="space-y-4">
                  {hasUserInsertPolicy ? (
                    <div className="flex items-start space-x-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium text-yellow-900">INSERT 정책 발견</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                          users 테이블에 INSERT 제한 정책이 있습니다. 이는 트리거 실행을 방해할 수 있습니다.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircleIcon className="h-6 w-6 text-green-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium text-green-900">INSERT 정책 없음</h3>
                        <p className="text-sm text-green-700 mt-1">
                          트리거 실행을 방해하는 INSERT 제한 정책이 없습니다.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">활성 RLS 정책:</h4>
                    <div className="space-y-2">
                      {rlsPolicies.map((policy, index) => (
                        <div key={index} className="border border-gray-200 rounded p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-gray-900">{policy.policyname}</h5>
                            <span className={`px-2 py-1 text-xs rounded ${
                              policy.cmd === 'INSERT' ? 'bg-red-100 text-red-800' :
                              policy.cmd === 'SELECT' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {policy.cmd}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            <strong>조건:</strong> {policy.qual || 'N/A'}
                          </p>
                          {policy.with_check && (
                            <p className="text-sm text-gray-600">
                              <strong>체크:</strong> {policy.with_check}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-medium text-blue-900">RLS 정책 없음</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      users 테이블에 활성 RLS 정책이 없습니다. RLS가 비활성화되어 있을 수 있습니다.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="bg-white rounded-xl shadow-soft mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">진단 및 수정 도구</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={loadDatabaseStatus}
                  disabled={loading}
                  className="btn-outline w-full"
                >
                  {loading ? '새로고침 중...' : '상태 새로고침'}
                </button>
                
                <button
                  onClick={testTrigger}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  트리거 테스트
                </button>
                
                {syncStatus && syncStatus.missing_profiles > 0 && (
                  <button
                    onClick={fixMissingProfiles}
                    disabled={loading}
                    className="btn-success w-full"
                  >
                    누락된 프로필 수정
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 테스트 결과 */}
          {testResult && (
            <div className="bg-white rounded-xl shadow-soft">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">테스트 결과</h2>
              </div>
              <div className="p-6">
                <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded overflow-auto">
                  {testResult}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}