'use client';

import React from 'react';
import { Header } from '@/components/layout/header';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 글로벌 에러 이벤트 발송
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('reactError', {
          detail: {
            message: error.message,
            stack: error.stack,
            name: error.name,
            componentStack: errorInfo.componentStack,
          },
        })
      );
    }

    console.error('🚨 React Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    console.log('Error boundary reset');
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
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
                  onClick={this.handleReset}
                  className='w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium'
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

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className='mt-4 text-left'>
                  <summary className='cursor-pointer text-sm text-gray-500 hover:text-gray-700'>
                    개발자 정보 (개발 환경에서만 표시)
                  </summary>
                  <pre className='mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32'>
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Header />
      <main>{children}</main>
    </ErrorBoundary>
  );
}
