/**
 * Enhanced Authentication Middleware
 * - JWT Token validation
 * - Rate limiting protection
 * - Session security
 * - Role-based access control
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export interface AuthResult {
  authorized: boolean
  user?: any
  redirect?: string
  error?: string
}

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Rate limiting middleware
 */
function checkRateLimit(identifier: string, maxRequests = 100, windowMs = 60000): boolean {
  const now = Date.now()
  const store = rateLimitStore.get(identifier)
  
  if (!store || now > store.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (store.count >= maxRequests) {
    return false
  }
  
  store.count++
  return true
}

/**
 * Enhanced user authentication with security checks
 */
export async function authenticateUser(request?: NextRequest): Promise<AuthResult> {
  try {
    const supabase = createClient()
    
    // Rate limiting check
    if (request) {
      const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
      if (!checkRateLimit(clientIP, 100, 60000)) {
        logger.warn('Rate limit exceeded', { ip: clientIP })
        return {
          authorized: false,
          error: 'Rate limit exceeded'
        }
      }
    }
    
    // Get user with enhanced error handling
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      logger.error('Auth error', { error: error.message })
      return {
        authorized: false,
        redirect: '/auth/login',
        error: 'Authentication failed'
      }
    }
    
    if (!user) {
      return {
        authorized: false,
        redirect: '/auth/login'
      }
    }
    
    // Additional security checks
    const lastActivity = user.last_sign_in_at
    if (lastActivity) {
      const hoursSinceLastActivity = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60)
      if (hoursSinceLastActivity > 24) {
        logger.warn('Stale session detected', { userId: user.id, hoursSince: hoursSinceLastActivity })
        // Force re-authentication for sessions older than 24 hours
        await supabase.auth.signOut()
        return {
          authorized: false,
          redirect: '/auth/login',
          error: 'Session expired'
        }
      }
    }
    
    return {
      authorized: true,
      user
    }
    
  } catch (error) {
    logger.error('Authentication error', { error })
    return {
      authorized: false,
      redirect: '/auth/login',
      error: 'Authentication system error'
    }
  }
}

/**
 * Role-based access control
 */
export async function checkRole(userId: string, requiredRole: 'admin' | 'instructor' | 'student'): Promise<boolean> {
  try {
    const supabase = createClient()
    
    switch (requiredRole) {
      case 'admin':
        const { data: adminProfile } = await supabase
          .from('admin_profiles')
          .select('id')
          .eq('user_id', userId)
          .single()
        return !!adminProfile
        
      case 'instructor':
        const { data: instructorProfile } = await supabase
          .from('instructor_profiles')
          .select('id')
          .eq('user_id', userId)
          .single()
        return !!instructorProfile
        
      case 'student':
        // All authenticated users are students by default
        return true
        
      default:
        return false
    }
  } catch (error) {
    logger.error('Role check error', { error, userId, requiredRole })
    return false
  }
}

/**
 * Security headers middleware
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // CSP Header
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.toss.im",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.toss.im",
    "frame-src 'self' https://js.toss.im"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  return response
}