export default function TestSafePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          ✅ 안전한 테스트 페이지
        </h1>
        <p className="text-gray-600 mb-6">
          이 페이지는 클라이언트 사이드 코드가 전혀 없는 순수 서버 컴포넌트입니다.
        </p>
        <p className="text-sm text-gray-500">
          만약 이 페이지에서도 Application error가 발생한다면,<br />
          문제는 Layout이나 다른 전역 설정에 있습니다.
        </p>
        <div className="mt-8 space-y-2">
          <a href="/" className="block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            메인 페이지로 이동
          </a>
          <a href="/auth/login" className="block bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700">
            로그인 페이지로 이동
          </a>
        </div>
      </div>
    </div>
  )
}