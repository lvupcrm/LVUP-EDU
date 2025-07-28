export default function DebugEnvPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Environment Variables Debug</h1>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">NEXT_PUBLIC_SUPABASE_URL</h2>
          <p className="text-sm text-gray-600 break-all">
            {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ NOT SET'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">NEXT_PUBLIC_SUPABASE_ANON_KEY</h2>
          <p className="text-sm text-gray-600 break-all">
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
              `✅ SET (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...)` : 
              '❌ NOT SET'
            }
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">NEXT_PUBLIC_API_URL</h2>
          <p className="text-sm text-gray-600">
            {process.env.NEXT_PUBLIC_API_URL || '❌ NOT SET'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">NODE_ENV</h2>
          <p className="text-sm text-gray-600">
            {process.env.NODE_ENV || '❌ NOT SET'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Vercel Environment</h2>
          <p className="text-sm text-gray-600">
            VERCEL: {process.env.VERCEL || '❌ NOT SET'}<br/>
            VERCEL_ENV: {process.env.VERCEL_ENV || '❌ NOT SET'}<br/>
            VERCEL_URL: {process.env.VERCEL_URL || '❌ NOT SET'}
          </p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">설정해야 할 환경 변수</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• NEXT_PUBLIC_SUPABASE_URL=https://lhbbnkhytojlvefzcdca.supabase.co</li>
          <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</li>
          <li>• NEXT_PUBLIC_API_URL=http://localhost:8000 (선택사항)</li>
        </ul>
      </div>
    </div>
  )
}