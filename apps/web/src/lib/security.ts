/**
 * Security Utilities
 * - Input validation and sanitization
 * - CSRF protection
 * - SQL injection prevention
 * - XSS protection
 */

import { NextRequest } from 'next/server'
import { logger } from './logger'

/**
 * Input sanitization
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .slice(0, 10000) // Limit length
}

/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * SQL injection detection
 */
export function containsSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|\*\/|\/\*)/,
    /(\bOR\b.*=.*|\bAND\b.*=.*)/i,
    /['"]\s*(OR|AND)\s*['"]/i
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}

/**
 * XSS detection
 */
export function containsXSS(input: string): boolean {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /expression\s*\(/i
  ]
  
  return xssPatterns.some(pattern => pattern.test(input))
}

/**
 * Validate and sanitize request body
 */
export function validateRequestBody(body: any): { isValid: boolean; sanitized: any; errors: string[] } {
  const errors: string[] = []
  const sanitized: any = {}
  
  if (!body || typeof body !== 'object') {
    return { isValid: false, sanitized: {}, errors: ['Invalid request body'] }
  }
  
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      // Check for security threats
      if (containsSQLInjection(value)) {
        errors.push(`SQL injection detected in field: ${key}`)
        continue
      }
      
      if (containsXSS(value)) {
        errors.push(`XSS attempt detected in field: ${key}`)
        continue
      }
      
      // Sanitize the value
      sanitized[key] = sanitizeInput(value)
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => 
        typeof item === 'string' ? sanitizeInput(item) : item
      )
    } else {
      sanitized[key] = value
    }
  }
  
  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  }
}

/**
 * CSRF token validation
 */
export function validateCSRFToken(request: NextRequest): boolean {
  const token = request.headers.get('x-csrf-token')
  const sessionToken = request.cookies.get('csrf-token')?.value
  
  if (!token || !sessionToken) {
    return false
  }
  
  return token === sessionToken
}

/**
 * Request origin validation
 */
export function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'https://lvup-edu.vercel.app'
  ].filter((origin): origin is string => Boolean(origin))
  
  // For same-origin requests
  if (!origin && !referer) {
    return true
  }
  
  // Check origin
  if (origin && !allowedOrigins.includes(origin)) {
    return false
  }
  
  // Check referer
  if (referer && !allowedOrigins.some(allowed => referer.startsWith(allowed))) {
    return false
  }
  
  return true
}

/**
 * Rate limiting by IP
 */
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkIPRateLimit(
  ip: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const record = ipRequestCounts.get(ip)
  
  if (!record || now > record.resetTime) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxRequests) {
    logger.warn('IP rate limit exceeded', { ip, count: record.count })
    return false
  }
  
  record.count++
  return true
}

/**
 * Security audit logging
 */
export function logSecurityEvent(
  type: 'auth_failure' | 'rate_limit' | 'xss_attempt' | 'sql_injection' | 'csrf_failure',
  details: Record<string, any>
): void {
  logger.warn(`Security Event: ${type}`, {
    type,
    timestamp: new Date().toISOString(),
    ...details
  })
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}