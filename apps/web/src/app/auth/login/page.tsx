import Link from 'next/link'

export default function LoginPageSimple() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            LVUP EDU 로그인
          </h2>
          <p className="mt-2 text-gray-600">
            피트니스 전문가들의 성장 파트너
          </p>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              서비스 준비 중
            </h3>
            <p className="text-blue-700 mb-4">
              로그인 기능은 현재 개발 중입니다.<br />
              곧 더 나은 서비스로 찾아뵙겠습니다.
            </p>
            <Link
              href="/"
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
            >
              메인으로 돌아가기
            </Link>
          </div>
        </div>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            아직 계정이 없으신가요?{' '}
            <Link
              href="/auth/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              회원가입
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}