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
    console.error('Critical error: Supabase client is not initialized')
    throw new Error('인증 서비스를 초기화할 수 없습니다. 잠시 후 다시 시도해주세요.')
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
      console.error('Certificate fetch error:', error.message || error)
      throw new Error('수료증 데이터를 불러오는데 실패했습니다.')
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
      console.error('Single certificate fetch error:', error.message || error)
      throw new Error('수료증 정보를 불러오는데 실패했습니다.')
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
      console.error('Lesson fetch error:', lessonError.message || lessonError)
      throw new Error('레슨 정보를 불러오는데 실패했습니다.')
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
    // First, check if this lesson was already completed
    const { data: currentProgress } = await client
      .from('lesson_progress')
      .select('completed')
      .eq('lesson_id', lessonId)
      .eq('user_id', userId)
      .single()

    const wasCompleted = currentProgress?.completed || false

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
      console.error('Progress update error:', error.message || error)
      throw new Error('학습 진도를 업데이트하는데 실패했습니다.')
    }

    // If lesson is newly completed (wasn't completed before but is now)
    if (!wasCompleted && progressData.completed) {
      try {
        // Get lesson and course information for notification
        const { data: lessonData } = await client
          .from('lessons')
          .select(`
            title,
            course_id,
            course:courses(title)
          `)
          .eq('id', lessonId)
          .single()

        if (lessonData) {
          // Create lesson completion notification
          const { error: notificationError } = await client.rpc('create_notification', {
            target_user_id: userId,
            notification_type: 'lesson_completed',
            notification_title: '레슨을 완료했습니다!',
            notification_message: `"${lessonData.title}" 레슨을 성공적으로 완료했습니다. 다음 레슨을 계속 진행해보세요!`,
            notification_data: {
              lesson_id: lessonId,
              lesson_title: lessonData.title,
              course_id: lessonData.course_id,
              course_title: lessonData.course?.title
            }
          })

          if (notificationError) {
            console.error('Error creating lesson completion notification:', notificationError)
          }

          // Check if this completion results in course completion
          await checkAndHandleCourseCompletion(client, lessonData.course_id, userId)
        }
      } catch (notificationError) {
        console.error('Error handling lesson completion notification:', notificationError)
      }
    }

    return data
  })
}

/**
 * Check if course is completed and handle course completion notification
 */
async function checkAndHandleCourseCompletion(
  client: any, 
  courseId: string, 
  userId: string
) {
  try {
    // Get total lessons in course
    const { data: totalLessons, error: totalError } = await client
      .from('lessons')
      .select('id')
      .eq('course_id', courseId)

    if (totalError || !totalLessons) return

    // Get completed lessons by user in this course
    const { data: completedLessons, error: completedError } = await client
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('completed', true)
      .in('lesson_id', totalLessons.map(l => l.id))

    if (completedError || !completedLessons) return

    // Check if course is completed (all lessons completed)
    if (completedLessons.length === totalLessons.length) {
      // Get course information
      const { data: courseData } = await client
        .from('courses')
        .select('title')
        .eq('id', courseId)
        .single()

      if (courseData) {
        // Create course completion notification
        const { error: courseNotificationError } = await client.rpc('create_notification', {
          target_user_id: userId,
          notification_type: 'course_completed',
          notification_title: '🎉 강의를 완주했습니다!',
          notification_message: `축하합니다! "${courseData.title}" 강의를 모두 완료했습니다. 수료증을 발급받으실 수 있습니다.`,
          notification_data: {
            course_id: courseId,
            course_title: courseData.title
          }
        })

        if (courseNotificationError) {
          console.error('Error creating course completion notification:', courseNotificationError)
        }
      }
    }
  } catch (error) {
    console.error('Error checking course completion:', error)
  }
}