/**
 * Supabase Helper Functions
 * - Type-safe database operations
 * - Error handling wrappers
 * - Common query patterns
 */

import { getSupabaseClient, safeSupabaseOperation } from './supabase'

/**
 * Get Supabase client with null check and error handling
 */
export function getSupabaseClientSafe() {
  const client = getSupabaseClient()
  if (!client) {
    throw new Error('Supabase client is not initialized')
  }
  return client
}

/**
 * Type-safe certificate data interface
 */
export interface CertificateData {
  id: string
  certificate_number: string
  issued_at: string
  user: {
    name: string
  }
  course: {
    title: string
    instructor: {
      user: {
        name: string
      }
    }
  }
  enrollment: {
    started_at: string
    completed_at: string
    progress: number
  }
}

/**
 * Fetch certificates with proper type safety
 */
export async function fetchUserCertificates(userId: string) {
  return safeSupabaseOperation(async (client) => {
    const { data, error } = await client
      .from('certificates')
      .select(`
        id,
        certificate_number,
        issued_at,
        course:courses(
          title,
          thumbnail,
          instructor:instructors(
            user:users(name)
          )
        ),
        enrollment:enrollments(
          started_at,
          completed_at,
          progress
        )
      `)
      .eq('user_id', userId)
      .order('issued_at', { ascending: false })

    if (error) {
      console.error('Error fetching certificates:', error)
      throw error
    }

    return data || []
  })
}

/**
 * Fetch single certificate with proper type safety
 */
export async function fetchCertificateById(id: string) {
  return safeSupabaseOperation(async (client) => {
    const { data, error } = await client
      .from('certificates')
      .select(`
        id,
        certificate_number,
        issued_at,
        user:users(name),
        course:courses(
          title,
          instructor:instructors(
            user:users(name)
          )
        ),
        enrollment:enrollments(
          started_at,
          completed_at,
          progress
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching certificate:', error)
      throw error
    }

    return data
  })
}

/**
 * Fetch lesson with progress tracking
 */
export async function fetchLessonWithProgress(
  lessonId: string,
  userId: string
) {
  return safeSupabaseOperation(async (client) => {
    const { data: lesson, error: lessonError } = await client
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single()

    if (lessonError) {
      console.error('Error fetching lesson:', lessonError)
      throw lessonError
    }

    const { data: progress, error: progressError } = await client
      .from('lesson_progress')
      .select('*')
      .eq('lesson_id', lessonId)
      .eq('user_id', userId)
      .single()

    if (progressError && progressError.code !== 'PGRST116') {
      console.error('Error fetching progress:', progressError)
    }

    return {
      lesson,
      progress: progress || null
    }
  })
}

/**
 * Update lesson progress with type safety
 */
export async function updateLessonProgress(
  lessonId: string,
  userId: string,
  progressData: {
    last_position?: number
    completed?: boolean
    completion_percentage?: number
  }
) {
  return safeSupabaseOperation(async (client) => {
    const { data, error } = await client
      .from('lesson_progress')
      .upsert({
        lesson_id: lessonId,
        user_id: userId,
        ...progressData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating lesson progress:', error)
      throw error
    }

    return data
  })
}