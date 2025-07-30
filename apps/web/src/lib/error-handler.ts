/**
 * Centralized Error Handling System
 * - Error classification
 * - User-friendly messages
 * - Error reporting
 * - Recovery strategies
 */

import React from 'react'
import { logger } from './logger'

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType
  message: string
  userMessage: string
  statusCode: number
  originalError?: Error
  context?: Record<string, any>
  recoverable?: boolean
  retryable?: boolean
  stack?: string
}

export class CustomError extends Error implements AppError {
  type: ErrorType
  userMessage: string
  statusCode: number
  originalError?: Error
  context?: Record<string, any>
  recoverable: boolean
  retryable: boolean

  constructor(
    type: ErrorType,
    message: string,
    userMessage: string,
    statusCode: number = 500,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(message)
    this.name = 'CustomError'
    this.type = type
    this.userMessage = userMessage
    this.statusCode = statusCode
    this.originalError = originalError
    this.context = context
    this.recoverable = this.isRecoverable()
    this.retryable = this.isRetryable()
  }

  private isRecoverable(): boolean {
    return [
      ErrorType.VALIDATION,
      ErrorType.NOT_FOUND,
      ErrorType.AUTHENTICATION
    ].includes(this.type)
  }

  private isRetryable(): boolean {
    return [
      ErrorType.NETWORK,
      ErrorType.EXTERNAL_SERVICE,
      ErrorType.RATE_LIMIT
    ].includes(this.type)
  }
}

// Predefined error creators
export const ErrorCreators = {
  validation: (message: string, context?: Record<string, any>) =>
    new CustomError(
      ErrorType.VALIDATION,
      message,
      '입력 정보를 확인해주세요.',
      400,
      undefined,
      context
    ),

  authentication: (message: string = 'Authentication failed') =>
    new CustomError(
      ErrorType.AUTHENTICATION,
      message,
      '로그인이 필요합니다.',
      401
    ),

  authorization: (message: string = 'Access denied') =>
    new CustomError(
      ErrorType.AUTHORIZATION,
      message,
      '접근 권한이 없습니다.',
      403
    ),

  notFound: (resource: string) =>
    new CustomError(
      ErrorType.NOT_FOUND,
      `${resource} not found`,
      '요청하신 정보를 찾을 수 없습니다.',
      404
    ),

  conflict: (message: string) =>
    new CustomError(
      ErrorType.CONFLICT,
      message,
      '이미 존재하는 정보입니다.',
      409
    ),

  rateLimit: () =>
    new CustomError(
      ErrorType.RATE_LIMIT,
      'Rate limit exceeded',
      '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
      429
    ),

  externalService: (service: string, originalError: Error) =>
    new CustomError(
      ErrorType.EXTERNAL_SERVICE,
      `External service error: ${service}`,
      '외부 서비스 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      502,
      originalError
    ),

  database: (operation: string, originalError: Error) =>
    new CustomError(
      ErrorType.DATABASE,
      `Database error during ${operation}`,
      '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      500,
      originalError
    ),

  network: (originalError: Error) =>
    new CustomError(
      ErrorType.NETWORK,
      'Network error',
      '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
      503,
      originalError
    )
}

// Error handler for API routes
export function handleAPIError(error: unknown): {
  error: AppError
  response: {
    error: string
    message: string
    type?: string
    recoverable?: boolean
    retryable?: boolean
  }
} {
  let appError: AppError

  if (error instanceof CustomError) {
    appError = error
  } else if (error instanceof Error) {
    // Try to classify the error
    if (error.message.includes('UNIQUE constraint')) {
      appError = ErrorCreators.conflict('이미 존재하는 정보입니다.')
    } else if (error.message.includes('NOT NULL constraint')) {
      appError = ErrorCreators.validation('필수 정보가 누락되었습니다.')
    } else if (error.message.includes('FOREIGN KEY constraint')) {
      appError = ErrorCreators.validation('유효하지 않은 참조 정보입니다.')
    } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      appError = ErrorCreators.network(error)
    } else {
      appError = new CustomError(
        ErrorType.UNKNOWN,
        error.message,
        '예상치 못한 오류가 발생했습니다.',
        500,
        error
      )
    }
  } else {
    appError = new CustomError(
      ErrorType.UNKNOWN,
      'Unknown error occurred',
      '예상치 못한 오류가 발생했습니다.',
      500
    )
  }

  // Log the error
  logger.error('API Error', {
    type: appError.type,
    message: appError.message,
    userMessage: appError.userMessage,
    statusCode: appError.statusCode,
    context: appError.context,
    stack: appError.originalError?.stack || appError.stack
  })

  return {
    error: appError,
    response: {
      error: appError.userMessage,
      message: appError.message,
      type: appError.type,
      recoverable: appError.recoverable,
      retryable: appError.retryable
    }
  }
}

// Client-side error handler
export function handleClientError(error: unknown): {
  message: string
  type: ErrorType
  recoverable: boolean
  retryable: boolean
} {
  if (error instanceof CustomError) {
    return {
      message: error.userMessage,
      type: error.type,
      recoverable: error.recoverable,
      retryable: error.retryable
    }
  }

  if (error instanceof Error) {
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        message: '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
        type: ErrorType.NETWORK,
        recoverable: false,
        retryable: true
      }
    }

    // Timeout errors
    if (error.message.includes('timeout')) {
      return {
        message: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
        type: ErrorType.NETWORK,
        recoverable: false,
        retryable: true
      }
    }
  }

  return {
    message: '예상치 못한 오류가 발생했습니다.',
    type: ErrorType.UNKNOWN,
    recoverable: false,
    retryable: false
  }
}

// Retry logic for retryable errors
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      
      const errorInfo = handleClientError(error)
      
      if (!errorInfo.retryable || attempt === maxRetries) {
        throw lastError
      }

      logger.warn(`Retry attempt ${attempt}/${maxRetries}`, {
        error: lastError.message,
        attempt,
        delay
      })

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
    }
  }

  throw lastError!
}

// Error boundary helper for React
export function createErrorBoundary(
  fallbackComponent: React.ComponentType<{ error: Error; reset: () => void }>
) {
  return class ErrorBoundary extends React.Component<
    React.PropsWithChildren<{}>,
    { hasError: boolean; error?: Error }
  > {
    constructor(props: React.PropsWithChildren<{}>) {
      super(props)
      this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      logger.error('React Error Boundary', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      })
    }

    render() {
      if (this.state.hasError && this.state.error) {
        return React.createElement(fallbackComponent, {
          error: this.state.error,
          reset: () => this.setState({ hasError: false, error: undefined })
        })
      }

      return this.props.children
    }
  }
}