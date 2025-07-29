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
  const { pathname } = request.nextUrl
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  
  // 1. Rate Limiting 체크
  if (!rateLimit(ip)) {
    return new NextResponse('Too Many Requests', { 
      status: 429,
      headers: {
        'Retry-After': '900', // 15분
        ...securityHeaders
      }
    })
  }
  
  // 2. 보안 헤더 적용을 위한 응답 생성
  const response = NextResponse.next()
  
  // 보안 헤더 추가
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // 3. API 경로는 인증 체크 스킵 (API 내에서 처리)
  if (pathname.startsWith('/api/')) {
    return response
  }
  
  // 4. 정적 파일은 스킵
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return response
  }
  
  // 5. Supabase 클라이언트 생성
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )
  
  // 6. 사용자 세션 확인
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Auth middleware error:', error)
  }
  
  // 7. 관리자 페이지 접근 제어
  if (matchesPath(pathname, adminPaths)) {
    if (!session) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    // 관리자 권한 확인
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  // 8. 보호된 페이지 접근 제어
  if (matchesPath(pathname, protectedPaths)) {
    if (!session) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  // 9. 로그인 상태에서 auth 페이지 접근 시 리다이렉트
  if (session && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup'))) {
    const returnUrl = request.nextUrl.searchParams.get('returnUrl')
    return NextResponse.redirect(new URL(returnUrl || '/', request.url))
  }
  
  // 10. 강사 대시보드 접근 제어
  if (pathname.startsWith('/instructor/dashboard')) {
    if (!session) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    // 강사 권한 확인
    const { data: profile } = await supabase
      .from('instructor_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()
    
    if (!profile) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
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