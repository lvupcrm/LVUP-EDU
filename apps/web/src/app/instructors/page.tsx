import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { MapPinIcon, AcademicCapIcon, ClockIcon } from '@heroicons/react/24/outline'

async function getInstructors() {
  const { data: instructors, error } = await supabase
    .from('instructor_profiles')
    .select(`
      id,
      bio,
      experience_years,
      user:users (
        id,
        name,
        avatar,
        specialties,
        location
      ),
      _count:courses(count)
    `)
    .order('experience_years', { ascending: false })

  if (error) {
    console.error('Error fetching instructors:', error)
    return []
  }

  return instructors || []
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
                  {instructor.user?.avatar ? (
                    <img
                      src={instructor.user.avatar}
                      alt={instructor.user.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary-500 to-fitness-500 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {instructor.user?.name?.charAt(0) || 'I'}
                      </span>
                    </div>
                  )}
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {instructor.user?.name}
                    </h3>
                    <p className="text-sm text-gray-600">피트니스 전문가</p>
                  </div>
                </div>

                {/* 전문 분야 태그 */}
                {instructor.user?.specialties && instructor.user.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {instructor.user.specialties.slice(0, 3).map((specialty, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        {specialty}
                      </span>
                    ))}
                    {instructor.user.specialties.length > 3 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{instructor.user.specialties.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* 정보 */}
                <div className="space-y-2 text-sm text-gray-600">
                  {instructor.user?.location && (
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{instructor.user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>경력 {instructor.experience_years}년</span>
                  </div>
                  <div className="flex items-center">
                    <AcademicCapIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{instructor._count || 0}개 강의</span>
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