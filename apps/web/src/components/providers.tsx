'use client';

import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  // 에러를 글로벌 에러 이벤트로 발송
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('reactError', {
        detail: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      })
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-6'>
        <div className='text-center'>
          <div className='text-red-500 text-6xl mb-4'>⚠️</div>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            앱 오류가 발생했습니다
          </h2>
          <p className='text-gray-600 mb-6'>
            일시적인 오류입니다. 페이지를 새로고침하거나 잠시 후 다시
            시도해주세요.
          </p>
          <div className='space-y-3'>
            <button
              onClick={resetErrorBoundary}
              className='w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 font-medium'
            >
              다시 시도
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              className='w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium'
            >
              홈으로 이동
            </button>
          </div>

          {/* 개발 환경에서만 에러 상세 정보 표시 */}
          {process.env.NODE_ENV === 'development' && (
            <details className='mt-4 text-left'>
              <summary className='cursor-pointer text-sm text-gray-500 hover:text-gray-700'>
                개발자 정보 (개발 환경에서만 표시)
              </summary>
              <pre className='mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32'>
                {error.message}
                {'\n\n'}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error(
          'React Error Boundary caught an error:',
          error,
          errorInfo
        );

        // 에러 정보를 더 상세하게 로깅
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          errorBoundary: errorInfo.errorBoundary,
        });
      }}
      onReset={() => {
        // 에러 상태 리셋 시 실행할 로직
        console.log('Error boundary reset');

        // 페이지 새로고침으로 완전한 복구 시도
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
