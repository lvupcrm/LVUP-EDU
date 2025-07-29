'use client'

import { useEffect, useState } from 'react'

export default function EnvDebugPage() {
  const [envInfo, setEnvInfo] = useState<any>(null)
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null)

  useEffect(() => {
    const checkEnv = async () => {
      // 환경 변수 상태 확인
      const info = {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasTossKey: !!process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
        nodeEnv: process.env.NODE_ENV,
        // URL과 키의 앞 10자리만 표시 (보안상)
        urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
        keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
      }
      setEnvInfo(info)

      // Supabase 클라이언트 상태 확인
      try {
        const { getSupabaseClient, isSupabaseReady, getSupabaseError } = await import('@/lib/supabase')
        const client = getSupabaseClient()
        const error = getSupabaseError()
        
        setSupabaseStatus({
          isReady: isSupabaseReady(),
          hasClient: !!client,
          error: error?.message || null
        })
      } catch (err) {
        setSupabaseStatus({
          isReady: false,
          hasClient: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    checkEnv()
  }, [])

  if (!envInfo || !supabaseStatus) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Environment Debug</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* 환경 변수 정보 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Supabase URL:</span>
                <span className={envInfo.hasSupabaseUrl ? 'text-green-600' : 'text-red-600'}>
                  {envInfo.hasSupabaseUrl ? '✓ Present' : '✗ Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Supabase Key:</span>
                <span className={envInfo.hasSupabaseKey ? 'text-green-600' : 'text-red-600'}>
                  {envInfo.hasSupabaseKey ? '✓ Present' : '✗ Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Toss Key:</span>
                <span className={envInfo.hasTossKey ? 'text-green-600' : 'text-red-600'}>
                  {envInfo.hasTossKey ? '✓ Present' : '✗ Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Node ENV:</span>
                <span>{envInfo.nodeEnv || 'undefined'}</span>
              </div>
            </div>
            
            {envInfo.hasSupabaseUrl && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">URL Preview: {envInfo.urlPrefix}</p>
                <p className="text-sm text-gray-600">Key Preview: {envInfo.keyPrefix}</p>
              </div>
            )}
          </div>

          {/* Supabase 클라이언트 상태 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Supabase Client Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Client Ready:</span>
                <span className={supabaseStatus.isReady ? 'text-green-600' : 'text-red-600'}>
                  {supabaseStatus.isReady ? '✓ Ready' : '✗ Not Ready'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Client Instance:</span>
                <span className={supabaseStatus.hasClient ? 'text-green-600' : 'text-red-600'}>
                  {supabaseStatus.hasClient ? '✓ Created' : '✗ Failed'}
                </span>
              </div>
            </div>
            
            {supabaseStatus.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-600 font-medium">Error:</p>
                <p className="text-sm text-red-600">{supabaseStatus.error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            ⚠️ 주의사항
          </h3>
          <p className="text-yellow-700">
            이 페이지는 디버깅용입니다. 프로덕션에서는 제거해야 합니다.
          </p>
        </div>
      </div>
    </div>
  )
}