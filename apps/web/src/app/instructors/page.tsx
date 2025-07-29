import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { MapPinIcon, AcademicCapIcon, ClockIcon } from '@heroicons/react/24/outline'

interface User {
  id: string
  name: string
  avatar?: string
  specialties?: string[]
  location?: string
}

interface Instructor {
  id: string
  bio?: string
  experience_years?: number
  users?: User
  courseCount?: number
}

async function getInstructors(): Promise<Instructor[]> {
  // N+1 쿼리 문제 해결: 단일 쿼리로 강사 정보와 강의 수를 함께 가져오기
  const { data: instructorsWithCounts, error } = await supabase
    .rpc('get_instructors_with_course_count')

  if (error) {
    // Development에서만 에러 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching instructors:', error)
    }
    return []
  }

  if (!instructorsWithCounts) {
    return []
  }

  return instructorsWithCounts.map((instructor: any) => ({
    id: instructor.id,
    bio: instructor.bio,
    experience_years: instructor.experience_years,
    users: {
      id: instructor.user_id,
      name: instructor.user_name,
      avatar: instructor.user_avatar,
      specialties: instructor.user_specialties,
      location: instructor.user_location
    },
    courseCount: instructor.course_count || 0
  }))
}

export default async function InstructorsPage() {
  const instructors = await getInstructors()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">전문 강사진</h1>
          <p className="text-gray-600">LVUP EDU의 검증된 피트니스 전문가들을 만나보세요</p>
        </div>

        {/* 강사 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructors.map((instructor) => (
            <Link
              key={instructor.id}
              href={`/instructor/${instructor.id}`}
              className="bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-hover transition-shadow group"
            >
              <div className="p-6">
                {/* 프로필 이미지 */}
                <div className="flex items-center mb-4">
                  {instructor.users?.avatar ? (
                    <img
                      src={instructor.users.avatar}
                      alt={instructor.users.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary-500 to-fitness-500 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {instructor.users?.name?.charAt(0) || 'I'}
                      </span>
                    </div>
                  )}
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {instructor.users?.name}
                    </h3>
                    <p className="text-sm text-gray-600">피트니스 전문가</p>
                  </div>
                </div>

                {/* 전문 분야 태그 */}
                {instructor.users?.specialties && instructor.users.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {instructor.users.specialties.slice(0, 3).map((specialty: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        {specialty}
                      </span>
                    ))}
                    {instructor.users.specialties.length > 3 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{instructor.users.specialties.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* 정보 */}
                <div className="space-y-2 text-sm text-gray-600">
                  {instructor.users?.location && (
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{instructor.users.location}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>경력 {instructor.experience_years}년</span>
                  </div>
                  <div className="flex items-center">
                    <AcademicCapIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{instructor.courseCount || 0}개 강의</span>
                  </div>
                </div>

                {/* 소개 */}
                {instructor.bio && (
                  <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                    {instructor.bio}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* 빈 상태 */}
        {instructors.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AcademicCapIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">강사진 준비 중</h3>
            <p className="text-gray-600">곧 전문 강사진을 만나보실 수 있습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}