import { supabase } from '@/lib/supabase'
import CourseCard from '@/components/courses/CourseCard'
import CourseFilterSimple from '@/components/courses/CourseFilterSimple'

interface Course {
  id: string
  title: string
  description: string
  thumbnail?: string
  price: number
  is_free: boolean
  level: string
  enrollment_count: number
  average_rating: number
  instructor: {
    user: {
      name: string
      avatar?: string
    }
  }
}

async function getCourses(searchParams: URLSearchParams): Promise<Course[]> {
  try {
    let query = supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        thumbnail,
        price,
        is_free,
        level,
        enrollment_count,
        average_rating,
        category:categories(
          id,
          name,
          slug,
          type
        ),
        instructor_profiles!courses_instructor_id_fkey(
          user:users(
            name,
            avatar
          )
        )
      `)
      .eq('status', 'PUBLISHED')
      .eq('is_public', true)

    // 검색 필터
    const search = searchParams.get('search')
    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    // 레벨 필터
    const level = searchParams.get('level')
    if (level && level !== 'all') {
      query = query.eq('level', level.toUpperCase())
    }

    // 카테고리 필터 
    const category = searchParams.get('category')
    if (category && category !== 'all') {
      // 카테고리 slug로 먼저 category_id를 찾아서 필터링
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single()
      
      if (categoryData) {
        query = query.eq('category_id', categoryData.id)
      }
    }

    // 가격 필터
    const price = searchParams.get('price')
    if (price === 'free') {
      query = query.eq('is_free', true)
    } else if (price === 'paid') {
      query = query.eq('is_free', false)
    }

    // 정렬
    const sort = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') || 'desc'
    query = query.order(sort as any, { ascending: order === 'asc' })

    const { data, error } = await query

    if (error) {
      console.error('Supabase query error:', error)
      return []
    }

    // 데이터 변환
    return data?.map(course => ({
      ...course,
      level: course.level === 'BEGINNER' ? '초급' : 
             course.level === 'INTERMEDIATE' ? '중급' : '고급',
      instructor: {
        user: {
          name: (course as any).instructor_profiles?.user?.name || '알 수 없음',
          avatar: (course as any).instructor_profiles?.user?.avatar,
        }
      }
    })) || []
  } catch (error) {
    console.error('Failed to fetch courses:', error)
    return []
  }
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const urlSearchParams = new URLSearchParams()
  
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      urlSearchParams.set(key, Array.isArray(value) ? value[0] : value)
    }
  })

  const courses = await getCourses(urlSearchParams)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            피트니스 전문 강의
          </h1>
          <p className="text-gray-600">
            현장 전문가가 전하는 실전 중심의 피트니스 교육
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 필터 사이드바 */}
          <div className="lg:w-64 flex-shrink-0">
            <CourseFilterSimple />
          </div>

          {/* 강의 목록 */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                총 {courses.length}개의 강의
              </p>
            </div>

            {courses.length > 0 ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-gray-600">
                  다른 검색어나 필터를 시도해보세요.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}