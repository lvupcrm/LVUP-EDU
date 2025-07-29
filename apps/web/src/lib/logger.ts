/**
 * Production-safe logging utility
 * Prevents sensitive information from being logged in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: any
}

const isProduction = process.env.NODE_ENV === 'production'
const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Safe logger that only outputs in development
 */
export const logger = {
  debug: (message: string, context?: LogContext) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context ? JSON.stringify(context, null, 2) : '')
    }
  },

  info: (message: string, context?: LogContext) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, context ? JSON.stringify(context, null, 2) : '')
    }
  },

  warn: (message: string, context?: LogContext) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, context ? JSON.stringify(context, null, 2) : '')
    }
  },

  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    // Always log errors, but sanitize in production
    const errorInfo = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: isDevelopment ? error.stack : undefined
    } : error

    if (isProduction) {
      // In production, log minimal error info
      console.error(`[ERROR] ${message}`, {
        error: errorInfo,
        timestamp: new Date().toISOString(),
        ...context
      })
    } else {
      // In development, log full details
      console.error(`[ERROR] ${message}`, {
        error: errorInfo,
        context,
        timestamp: new Date().toISOString()
      })
    }
  }
}

/**
 * Performance logging for development
 */
export const perfLogger = {
  start: (label: string) => {
    if (isDevelopment) {
      console.time(`[PERF] ${label}`)
    }
  },

  end: (label: string) => {
    if (isDevelopment) {
      console.timeEnd(`[PERF] ${label}`)
    }
  }
}

/**
 * Safe API response logging
 * Filters out sensitive information
 */
export const apiLogger = {
  request: (method: string, url: string, context?: LogContext) => {
    if (isDevelopment) {
      logger.debug(`API Request: ${method} ${url}`, context)
    }
  },

  response: (method: string, url: string, status: number, context?: LogContext) => {
    if (isDevelopment) {
      logger.debug(`API Response: ${method} ${url} - ${status}`, context)
    }
  },

  error: (method: string, url: string, error: Error | unknown, context?: LogContext) => {
    logger.error(`API Error: ${method} ${url}`, error, context)
  }
}

/**
 * Database operation logging
 */
export const dbLogger = {
  query: (operation: string, table: string, context?: LogContext) => {
    if (isDevelopment) {
      logger.debug(`DB Query: ${operation} on ${table}`, context)
    }
  },

  error: (operation: string, table: string, error: Error | unknown, context?: LogContext) => {
    logger.error(`DB Error: ${operation} on ${table}`, error, context)
  }
}