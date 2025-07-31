'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  CogIcon,
  ShieldCheckIcon,
  BugAntIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface DiagnosticResult {
  category: string;
  status: 'success' | 'warning' | 'error';
  title: string;
  description: string;
  details?: string[];
  action?: string;
}

export default function ComprehensiveDiagnosisPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [testInProgress, setTestInProgress] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    success: 0,
    warning: 0,
    error: 0
  });

  const runComprehensiveDiagnosis = async () => {
    setLoading(true);
    setResults([]);
    
    const diagnosticResults: DiagnosticResult[] = [];
    
    try {
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
      }

      // 1. 트리거 존재 여부 확인
      try {
        const { data: triggerData, error: triggerError } = await supabase.rpc('get_trigger_status');
        
        if (triggerError) {
          diagnosticResults.push({
            category: 'triggers',
            status: 'error',
            title: '트리거 상태 조회 실패',
            description: `트리거 정보를 가져올 수 없습니다: ${triggerError.message}`,
            action: 'get_trigger_status 함수가 존재하는지 확인하고 마이그레이션을 실행하세요.'
          });
        } else {
          const authTrigger = triggerData?.find((t: any) => t.trigger_name === 'on_auth_user_created');
          
          if (authTrigger) {
            diagnosticResults.push({
              category: 'triggers',
              status: 'success',
              title: 'Auth 트리거 존재',
              description: `'on_auth_user_created' 트리거가 정상적으로 존재합니다.`,
              details: [
                `테이블: ${authTrigger.trigger_table}`,
                `이벤트: ${authTrigger.event_manipulation} ${authTrigger.action_timing}`,
                `함수: ${authTrigger.action_statement}`
              ]
            });
          } else {
            diagnosticResults.push({
              category: 'triggers',
              status: 'error',
              title: 'Auth 트리거 누락',
              description: 'on_auth_user_created 트리거가 존재하지 않습니다.',
              action: '마이그레이션 20241201000004_fix_missing_users.sql을 실행하세요.'
            });
          }
        }
      } catch (err) {
        diagnosticResults.push({
          category: 'triggers',
          status: 'error',
          title: '트리거 진단 오류',
          description: `트리거 상태 확인 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
          action: 'Supabase 연결 상태를 확인하고 다시 시도하세요.'
        });
      }

      // 2. RLS 정책 확인
      try {
        const { data: rlsData, error: rlsError } = await supabase.rpc('get_rls_policies', { table_name: 'users' });
        
        if (rlsError) {
          diagnosticResults.push({
            category: 'rls',
            status: 'warning',
            title: 'RLS 정책 조회 실패',
            description: `RLS 정책 정보를 가져올 수 없습니다: ${rlsError.message}`,
            action: 'get_rls_policies 함수가 존재하는지 확인하세요.'
          });
        } else {
          const insertPolicies = rlsData?.filter((p: any) => p.cmd === 'INSERT') || [];
          
          if (insertPolicies.length > 0) {
            diagnosticResults.push({
              category: 'rls',
              status: 'warning',
              title: 'INSERT 제한 정책 발견',
              description: `users 테이블에 ${insertPolicies.length}개의 INSERT 제한 정책이 있습니다. 이는 트리거 실행을 방해할 수 있습니다.`,
              details: insertPolicies.map((p: any) => `${p.policyname}: ${p.qual}`),
              action: 'RLS 정책을 검토하고 필요시 SECURITY DEFINER 권한을 확인하세요.'
            });
          } else {
            diagnosticResults.push({
              category: 'rls',
              status: 'success',
              title: 'INSERT 정책 없음',
              description: 'users 테이블에 트리거 실행을 방해하는 INSERT 제한 정책이 없습니다.'
            });
          }
        }
      } catch (err) {
        diagnosticResults.push({
          category: 'rls',
          status: 'error',
          title: 'RLS 진단 오류',
          description: `RLS 정책 확인 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`
        });
      }

      // 3. 함수 권한 확인
      try {
        const { data: functionData, error: functionError } = await supabase.rpc('execute_sql', {
          sql: `
            SELECT 
              p.proname as function_name,
              p.prosecdef as security_definer,
              n.nspname as schema_name
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE p.proname = 'handle_new_user'
            AND n.nspname = 'public';
          `
        });

        if (functionError) {
          diagnosticResults.push({
            category: 'functions',
            status: 'warning',
            title: '함수 권한 확인 실패',
            description: `handle_new_user 함수 권한을 확인할 수 없습니다: ${functionError.message}`
          });
        } else if (functionData && functionData.length > 0) {
          const func = functionData[0];
          if (func.security_definer) {
            diagnosticResults.push({
              category: 'functions',
              status: 'success',
              title: '함수 권한 정상',
              description: 'handle_new_user 함수가 SECURITY DEFINER 권한을 가지고 있습니다.'
            });
          } else {
            diagnosticResults.push({
              category: 'functions',
              status: 'warning',
              title: '함수 권한 부족',
              description: 'handle_new_user 함수에 SECURITY DEFINER 권한이 없습니다.',
              action: '함수를 재생성하여 적절한 권한을 부여하세요.'
            });
          }
        } else {
          diagnosticResults.push({
            category: 'functions',
            status: 'error',
            title: '트리거 함수 누락',
            description: 'handle_new_user 함수가 존재하지 않습니다.',
            action: '마이그레이션을 실행하여 함수를 생성하세요.'
          });
        }
      } catch (err) {
        diagnosticResults.push({
          category: 'functions',
          status: 'error',
          title: '함수 진단 오류',
          description: `함수 상태 확인 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`
        });
      }

      // 4. 동기화 상태 확인
      try {
        const { data: syncData, error: syncError } = await supabase.rpc('check_user_sync_status');
        
        if (syncError) {
          diagnosticResults.push({
            category: 'sync',
            status: 'error',
            title: '동기화 상태 확인 실패',
            description: `사용자 동기화 상태를 확인할 수 없습니다: ${syncError.message}`
          });
        } else if (syncData && syncData.length > 0) {
          const sync = syncData[0];
          if (sync.sync_percentage >= 95) {
            diagnosticResults.push({
              category: 'sync',
              status: 'success',
              title: '동기화 상태 양호',
              description: `사용자 동기화율이 ${sync.sync_percentage}%입니다.`,
              details: [
                `Auth 사용자: ${sync.total_auth_users}명`,
                `Public 사용자: ${sync.total_public_users}명`,
                `누락된 프로필: ${sync.missing_profiles}개`
              ]
            });
          } else {
            diagnosticResults.push({
              category: 'sync',
              status: 'warning',
              title: '동기화 불완전',
              description: `사용자 동기화율이 ${sync.sync_percentage}%로 낮습니다.`,
              details: [
                `Auth 사용자: ${sync.total_auth_users}명`,
                `Public 사용자: ${sync.total_public_users}명`,
                `누락된 프로필: ${sync.missing_profiles}개`
              ],
              action: '누락된 프로필을 생성하고 트리거가 작동하는지 확인하세요.'
            });
          }
        }
      } catch (err) {
        diagnosticResults.push({
          category: 'sync',
          status: 'error',
          title: '동기화 진단 오류',
          description: `동기화 상태 확인 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`
        });
      }

      // 5. 데이터베이스 연결 상태 확인
      try {
        const { data, error } = await supabase.from('users').select('count', { count: 'exact' }).limit(1);
        
        if (error) {
          diagnosticResults.push({
            category: 'connection',
            status: 'error',
            title: '데이터베이스 연결 오류',
            description: `데이터베이스에 접근할 수 없습니다: ${error.message}`,
            action: 'Supabase 프로젝트 상태와 네트워크 연결을 확인하세요.'
          });
        } else {
          diagnosticResults.push({
            category: 'connection',
            status: 'success',
            title: '데이터베이스 연결 정상',
            description: 'Supabase 데이터베이스에 정상적으로 연결되었습니다.'
          });
        }
      } catch (err) {
        diagnosticResults.push({
          category: 'connection',
          status: 'error',
          title: '연결 테스트 실패',
          description: `데이터베이스 연결 테스트 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`
        });
      }

      setResults(diagnosticResults);
      
      // 통계 계산
      const summary = {
        total: diagnosticResults.length,
        success: diagnosticResults.filter(r => r.status === 'success').length,
        warning: diagnosticResults.filter(r => r.status === 'warning').length,
        error: diagnosticResults.filter(r => r.status === 'error').length
      };
      setSummary(summary);
      
    } catch (err) {
      console.error('Comprehensive diagnosis error:', err);
      setResults([{
        category: 'system',
        status: 'error',
        title: '진단 시스템 오류',
        description: `종합 진단 중 시스템 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
        action: '페이지를 새로고침하고 다시 시도하세요.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const runEndToEndTest = async () => {
    setTestInProgress(true);
    
    try {
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
      }

      const testEmail = `e2e-test-${Date.now()}@test.com`;
      
      // 1. 사용자 생성
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'testpassword123',
        options: {
          data: {
            full_name: 'E2E Test User'
          }
        }
      });

      if (authError && !authError.message.includes('already registered')) {
        throw new Error(`Auth 사용자 생성 실패: ${authError.message}`);
      }

      const userId = authData?.user?.id;
      if (!userId) {
        throw new Error('사용자 ID를 가져올 수 없습니다.');
      }

      // 2. 잠시 대기 (트리거 실행 시간)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 3. public.users 테이블 확인
      const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (publicError) {
        if (publicError.code === 'PGRST116') {
          setResults(prev => [...prev, {
            category: 'test',
            status: 'error',
            title: 'End-to-End 테스트 실패',
            description: 'Auth 사용자는 생성되었지만 public.users에 프로필이 생성되지 않았습니다.',
            details: [
              `테스트 이메일: ${testEmail}`,
              `사용자 ID: ${userId}`,
              '트리거가 작동하지 않거나 RLS 정책이 차단하고 있습니다.'
            ],
            action: '트리거 상태와 RLS 정책을 확인하세요.'
          }]);
        } else {
          throw new Error(`Public 사용자 조회 오류: ${publicError.message}`);
        }
      } else {
        setResults(prev => [...prev, {
          category: 'test',
          status: 'success',
          title: 'End-to-End 테스트 성공',
          description: '사용자 가입부터 프로필 생성까지 전체 프로세스가 정상 작동합니다.',
          details: [
            `테스트 이메일: ${testEmail}`,
            `사용자 ID: ${userId}`,
            `생성된 이름: ${publicUser.name}`,
            `역할: ${publicUser.role}`,
            '트리거가 정상적으로 작동하고 있습니다.'
          ]
        }]);
      }
      
    } catch (err) {
      console.error('E2E test error:', err);
      setResults(prev => [...prev, {
        category: 'test',
        status: 'error',
        title: 'End-to-End 테스트 오류',
        description: `테스트 실행 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
        action: '시스템 상태를 확인하고 다시 시도하세요.'
      }]);
    } finally {
      setTestInProgress(false);
    }
  };

  useEffect(() => {
    runComprehensiveDiagnosis();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-600" />;
      default:
        return <CogIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'triggers':
        return <CogIcon className="h-5 w-5" />;
      case 'rls':
        return <ShieldCheckIcon className="h-5 w-5" />;
      case 'functions':
        return <BugAntIcon className="h-5 w-5" />;
      case 'sync':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'connection':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'test':
        return <BugAntIcon className="h-5 w-5" />;
      default:
        return <CogIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔍 종합 진단 도구
            </h1>
            <p className="text-gray-600">
              Supabase 인증 시스템의 모든 구성 요소를 종합적으로 진단합니다.
            </p>
          </div>

          {/* 진단 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">총 검사 항목</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">정상</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.success}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">경고</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.warning}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">오류</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.error}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="bg-white rounded-xl shadow-soft mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">진단 및 테스트</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={runComprehensiveDiagnosis}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? '진단 중...' : '전체 진단 다시 실행'}
                </button>
                
                <button
                  onClick={runEndToEndTest}
                  disabled={testInProgress || loading}
                  className="btn-secondary"
                >
                  {testInProgress ? '테스트 중...' : 'End-to-End 테스트'}
                </button>
              </div>
            </div>
          </div>

          {/* 진단 결과 */}
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className={`border rounded-lg p-6 ${getStatusColor(result.status)}`}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(result.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getCategoryIcon(result.category)}
                      <span className="text-sm font-medium text-gray-600 uppercase">
                        {result.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {result.title}
                    </h3>
                    <p className="text-gray-700 mb-3">
                      {result.description}
                    </p>
                    
                    {result.details && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">세부 정보:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {result.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.action && (
                      <div className="bg-white bg-opacity-50 border border-gray-200 rounded p-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">권장 조치:</h4>
                        <p className="text-sm text-gray-700">{result.action}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {results.length === 0 && !loading && (
            <div className="bg-white rounded-xl shadow-soft p-8 text-center">
              <p className="text-gray-600">진단 결과가 없습니다. 진단을 실행하세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}