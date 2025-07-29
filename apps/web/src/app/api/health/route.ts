import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // 기본 상태 체크
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {} as Record<string, any>
    }

    // Supabase 연결 체크
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
        .single()
      
      health.services.database = {
        status: error ? 'unhealthy' : 'healthy',
        error: error?.message,
        responseTime: Date.now()
      }
    } catch (error) {
      health.services.database = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown database error'
      }
    }

    // 환경 변수 체크
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
    
    health.services.environment = {
      status: missingEnvVars.length === 0 ? 'healthy' : 'unhealthy',
      missingVariables: missingEnvVars
    }

    // 전체 상태 결정
    const allServicesHealthy = Object.values(health.services).every(
      service => service.status === 'healthy'
    )
    
    if (!allServicesHealthy) {
      health.status = 'unhealthy'
    }

    const statusCode = health.status === 'healthy' ? 200 : 503

    return NextResponse.json(health, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}