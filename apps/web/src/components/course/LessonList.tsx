import Link from 'next/link'
import { PlayCircleIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface Lesson {
  id: string
  title: string
  description?: string
  order_num: number
  duration?: number
  is_preview?: boolean
  video_url?: string
}

interface LessonProgress {
  lesson_id: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  progress_percentage: number
}

interface LessonListProps {
  courseId: string
  lessons: Lesson[]
  isEnrolled: boolean
  progress?: LessonProgress[]
}

export function LessonList({ courseId, lessons, isEnrolled, progress = [] }: LessonListProps) {
  const getProgressForLesson = (lessonId: string) => {
    return progress.find(p => p.lesson_id === lessonId)
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return ''
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}시간 ${mins}분`
    }
    return `${mins}분`
  }

  return (
    <div className="space-y-4">
      {lessons.map((lesson, index) => {
        const lessonProgress = getProgressForLesson(lesson.id)
        const isAccessible = isEnrolled || lesson.is_preview
        const isCompleted = lessonProgress?.status === 'COMPLETED'
        const isInProgress = lessonProgress?.status === 'IN_PROGRESS'

        return (
          <div
            key={lesson.id}
            className={`bg-white rounded-lg border ${
              isAccessible ? 'border-gray-200 hover:border-primary-300' : 'border-gray-100'
            } transition-colors`}
          >
            {isAccessible ? (
              <Link
                href={`/courses/${courseId}/lesson/${lesson.id}`}
                className="block p-6"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-green-100' : isInProgress ? 'bg-primary-100' : 'bg-gray-100'
                    }`}>
                      {isCompleted ? (
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                      ) : (
                        <span className={`text-lg font-semibold ${
                          isInProgress ? 'text-primary-600' : 'text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {lesson.title}
                      </h3>
                      {lesson.is_preview && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          미리보기
                        </span>
                      )}
                    </div>

                    {lesson.description && (
                      <p className="text-gray-600 text-sm mb-3">
                        {lesson.description}
                      </p>
                    )}

                    <div className="flex items-center text-sm text-gray-500">
                      <PlayCircleIcon className="h-4 w-4 mr-1" />
                      <span>동영상 강의</span>
                      {lesson.duration && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{formatDuration(lesson.duration)}</span>
                        </>
                      )}
                      {isInProgress && lessonProgress && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-primary-600">
                            {Math.round(lessonProgress.progress_percentage)}% 완료
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="p-6 opacity-60">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <LockClosedIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {lesson.title}
                    </h3>

                    {lesson.description && (
                      <p className="text-gray-600 text-sm mb-3">
                        {lesson.description}
                      </p>
                    )}

                    <div className="flex items-center text-sm text-gray-500">
                      <PlayCircleIcon className="h-4 w-4 mr-1" />
                      <span>동영상 강의</span>
                      {lesson.duration && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{formatDuration(lesson.duration)}</span>
                        </>
                      )}
                      <span className="mx-2">•</span>
                      <span className="text-gray-400">수강 신청 후 이용 가능</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}