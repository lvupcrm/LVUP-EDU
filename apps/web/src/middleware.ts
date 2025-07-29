import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Rate limiting (간단한 메모리 기반 - 프로덕션에서는 Redis 사용 권장)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// 보안 헤더 설정
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.tosspayments.com https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' blob: data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co https://api.tosspayments.com https://www.google-analytics.com",
    "media-src 'self' blob: https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
}

// 관리자 페이지 경로
const adminPaths = ['/admin']

// 인증이 필요한 페이지 경로
const protectedPaths = ['/my', '/payment', '/instructor/dashboard']

// 공개 페이지 경로 (인증 없이 접근 가능)
const publicPaths = [
  '/',
  '/courses',
  '/instructors', 
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/api/auth'
]

// Rate limiting 함수
function rateLimit(ip: string, limit: number = 100, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const windowStart = now - windowMs
  
  // 만료된 항목 정리
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now) {
      rateLimitMap.delete(key)
    }
  }
  
  const current = rateLimitMap.get(ip)
  
  if (!current) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.resetTime < now) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= limit) {
    return false
  }
  
  current.count++
  return true
}

// 경로 매칭 함수
function matchesPath(pathname: string, paths: string[]): boolean {
  return paths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  )
}

export async function middleware(request: NextRequest) {
  // 🚨 임시로 미들웨어 완전 비활성화 - Application error 테스트용
  const response = NextResponse.next()
  
  // 최소한의 보안 헤더만 적용
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  console.log('Middleware bypassed for:', request.nextUrl.pathname)
  
  return response
}

export const config = {
  matcher: [
    /*
     * 다음 경로들을 제외한 모든 요청에 매칭:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}