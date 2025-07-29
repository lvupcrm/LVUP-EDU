import { supabase } from '@/lib/supabase'
import { checkInstructorAuth } from '@/middleware/instructor'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  AcademicCapIcon,
  DocumentTextIcon,
  PlayCircleIcon,
  CogIcon,
  ChartBarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import CourseSettings from '@/components/instructor/CourseSettings'
import LessonManager from '@/components/instructor/LessonManager'
import CourseAnalytics from '@/components/instructor/CourseAnalytics'

interface PageProps {
  params: {
    id: string
  }
  searchParams: {
    tab?: string
  }
}

export default async function EditCoursePage({ params, searchParams }: PageProps) {
  const auth = await checkInstructorAuth()
  
  if (!auth.authorized) {
    redirect(auth.redirect!)
  }

  // 강의 정보 가져오기
  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      *,
      category:categories(
        id,
        name
      ),
      lessons(
        id,
        title,
        order_num,
        duration,
        is_preview,
        is_published
      )
    `)
    .eq('id', params.id)
    .eq('instructor_id', auth.instructorId)
    .single()

  if (error || !course) {
    notFound()
  }

  const currentTab = searchParams.tab || 'lessons'

  const tabs = [
    { id: 'lessons', label: '레슨 관리', icon: PlayCircleIcon },
    { id: 'settings', label: '강의 설정', icon: CogIcon },
    { id: 'analytics', label: '통계', icon: ChartBarIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/instructor/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            대시보드로 돌아가기
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 mt-2">
                {course.category?.name} · {course.lessons?.length || 0}개 레슨
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                course.status === 'PUBLISHED' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {course.status === 'PUBLISHED' ? '공개중' : '비공개'}
              </span>
              
              <Link
                href={`/courses/${course.id}`}
                className="btn-outline text-sm"
                target="_blank"
              >
                미리보기
              </Link>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="bg-white rounded-xl shadow-soft">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = currentTab === tab.id
                
                return (
                  <Link
                    key={tab.id}
                    href={`/instructor/courses/${params.id}/edit?tab=${tab.id}`}
                    className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      isActive
                        ? 'text-primary-600 border-primary-600'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {currentTab === 'lessons' && (
              <LessonManager courseId={params.id} lessons={course.lessons || []} />
            )}
            
            {currentTab === 'settings' && (
              <CourseSettings course={course} />
            )}
            
            {currentTab === 'analytics' && (
              <CourseAnalytics courseId={params.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}