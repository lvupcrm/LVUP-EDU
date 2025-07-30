'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { CheckCircleIcon, XCircleIcon, UserPlusIcon } from '@heroicons/react/24/outline';

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  user_metadata?: any;
}

interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

interface UserComparison {
  authUser: AuthUser;
  publicUser: PublicUser | null;
  hasMismatch: boolean;
}

export default function UserProfilesDebugPage() {
  const [comparisons, setComparisons] = useState<UserComparison[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadUserComparisons = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
      }

      // auth.users 데이터 가져오기 (RPC 함수 사용)
      const { data: authUsers, error: authError } = await supabase.rpc('get_auth_users');
      
      if (authError) {
        console.error('Auth users fetch error:', authError);
        throw new Error('Auth 사용자 목록을 가져올 수 없습니다.');
      }

      // public.users 데이터 가져오기
      const { data: publicUsers, error: publicError } = await supabase
        .from('users')
        .select('id, email, name, role, created_at');

      if (publicError) {
        console.error('Public users fetch error:', publicError);
        throw new Error('Public 사용자 목록을 가져올 수 없습니다.');
      }

      // 비교 데이터 생성
      const comparisons: UserComparison[] = authUsers.map((authUser: AuthUser) => {
        const publicUser = publicUsers.find((pu: PublicUser) => pu.id === authUser.id);
        
        return {
          authUser,
          publicUser: publicUser || null,
          hasMismatch: !publicUser
        };
      });

      setComparisons(comparisons);
      
    } catch (err) {
      console.error('Load error:', err);
      setError(err instanceof Error ? err.message : '데이터 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const createMissingProfile = async (authUser: AuthUser) => {
    try {
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        throw new Error('Supabase 클라이언트를 초기화할 수 없습니다.');
      }

      const profileData = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name || 
              authUser.user_metadata?.name || 
              authUser.email.split('@')[0] || 
              '사용자',
        role: 'STUDENT',
        created_at: authUser.created_at,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('users')
        .insert(profileData);

      if (error) {
        throw error;
      }

      setSuccess(`${authUser.email}의 프로필이 생성되었습니다.`);
      
      // 목록 새로고침
      await loadUserComparisons();
      
    } catch (err) {
      console.error('Profile creation error:', err);
      setError(err instanceof Error ? err.message : '프로필 생성 중 오류가 발생했습니다.');
    }
  };

  const createAllMissingProfiles = async () => {
    const missingProfiles = comparisons.filter(c => c.hasMismatch);
    
    if (missingProfiles.length === 0) {
      setSuccess('생성할 누락된 프로필이 없습니다.');
      return;
    }

    setLoading(true);
    
    try {
      for (const comparison of missingProfiles) {
        await createMissingProfile(comparison.authUser);
      }
      
      setSuccess(`${missingProfiles.length}개의 누락된 프로필이 생성되었습니다.`);
      
    } catch (err) {
      console.error('Batch creation error:', err);
      setError(err instanceof Error ? err.message : '일괄 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserComparisons();
  }, []);

  const missingCount = comparisons.filter(c => c.hasMismatch).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              사용자 프로필 디버그 도구
            </h1>
            <p className="text-gray-600">
              auth.users와 public.users 테이블 간의 동기화 상태를 확인합니다.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <UserPlusIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">총 Auth 사용자</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {comparisons.length}
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
                  <p className="text-sm text-gray-600">프로필 있음</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {comparisons.length - missingCount}
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
                  <p className="text-sm text-gray-600">프로필 누락</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {missingCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  사용자 목록
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={loadUserComparisons}
                    disabled={loading}
                    className="btn-outline text-sm"
                  >
                    새로고침
                  </button>
                  {missingCount > 0 && (
                    <button
                      onClick={createAllMissingProfiles}
                      disabled={loading}
                      className="btn-primary text-sm"
                    >
                      누락된 프로필 모두 생성
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">데이터를 불러오는 중...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comparisons.map((comparison) => (
                    <div 
                      key={comparison.authUser.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        comparison.hasMismatch 
                          ? 'border-red-200 bg-red-50' 
                          : 'border-green-200 bg-green-50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          comparison.hasMismatch 
                            ? 'bg-red-100' 
                            : 'bg-green-100'
                        }`}>
                          {comparison.hasMismatch ? (
                            <XCircleIcon className="h-5 w-5 text-red-600" />
                          ) : (
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {comparison.authUser.email}
                          </p>
                          <p className="text-sm text-gray-600">
                            Auth ID: {comparison.authUser.id}
                          </p>
                          <p className="text-sm text-gray-600">
                            생성일: {new Date(comparison.authUser.created_at).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {comparison.hasMismatch ? (
                          <div className="space-y-2">
                            <p className="text-sm text-red-600 font-medium">
                              프로필 누락
                            </p>
                            <button
                              onClick={() => createMissingProfile(comparison.authUser)}
                              disabled={loading}
                              className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              프로필 생성
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-sm text-green-600 font-medium">
                              프로필 존재
                            </p>
                            <p className="text-xs text-gray-500">
                              이름: {comparison.publicUser?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              역할: {comparison.publicUser?.role}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}