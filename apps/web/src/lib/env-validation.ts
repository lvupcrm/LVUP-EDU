/**
 * Environment variable validation utility
 * Provides secure validation without exposing sensitive values
 */

import { logger } from './logger'

interface EnvConfig {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  NEXT_PUBLIC_TOSS_CLIENT_KEY: string
  NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID?: string
}

interface ServerEnvConfig {
  TOSS_SECRET_KEY: string
}

/**
 * Validates client-side environment variables
 * These are safe to expose to the browser
 */
export function validateClientEnv(): EnvConfig {
  // Detect if we're in a build environment (Next.js build phase)
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                     process.env.NEXT_PHASE === 'phase-development-server' ||
                     typeof window === 'undefined' && !process.env.VERCEL_ENV

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'NEXT_PUBLIC_TOSS_CLIENT_KEY'
  ] as const

  const config: Partial<EnvConfig> = {}
  const missing: string[] = []

  for (const varName of requiredVars) {
    const value = process.env[varName]
    if (!value) {
      missing.push(varName)
      // Provide fallback values during build time
      if (isBuildTime) {
        config[varName] = `BUILD_TIME_PLACEHOLDER_${varName}` as any
      }
    } else {
      config[varName] = value
    }
  }

  // Optional environment variables
  if (process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID) {
    config.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID
  }

  if (missing.length > 0 && !isBuildTime) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  return config as EnvConfig
}

/**
 * Validates server-side environment variables
 * These should NEVER be exposed to the browser
 */
export function validateServerEnv(): ServerEnvConfig {
  const requiredVars = [
    'TOSS_SECRET_KEY'
  ] as const

  const config: Partial<ServerEnvConfig> = {}
  const missing: string[] = []

  for (const varName of requiredVars) {
    const value = process.env[varName]
    if (!value) {
      missing.push(varName)
    } else {
      config[varName] = value
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required server environment variables: ${missing.join(', ')}`)
  }

  return config as ServerEnvConfig
}

/**
 * Get environment status for health checks
 * Returns only validation status, not actual values
 */
export function getEnvStatus() {
  try {
    validateClientEnv()
    return {
      client: 'valid',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      client: 'invalid',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Safe environment info for logging/debugging
 * Never exposes actual values
 */
export function getEnvInfo() {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isVercel: !!process.env.VERCEL,
    vercelEnv: process.env.VERCEL_ENV || 'development',
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasTossClientKey: !!process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
    hasTossSecretKey: !!process.env.TOSS_SECRET_KEY,
    hasCloudflareAccount: !!process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID
  }
}