import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import CourseTable from '@/components/admin/CourseTable'

interface PageProps {
  searchParams: {
    search?: string
    status?: string
    category?: string
    page?: string
  }
}

export default async function AdminCoursesPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  // 코스 목록 쿼리
  let query = supabase
    .from('courses')
    .select(`
      *,
      instructor:instructors(
        user:users(name)
      ),
      enrollments:enrollments(count),
      reviews:reviews(rating)
    `, { count: 'exact' })

  // 검색 필터
  if (searchParams.search) {
    query = query.ilike('title', `%${searchParams.search}%`)
  }

  // 상태 필터
  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }

  // 카테고리 필터
  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }

  // 페이지네이션
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data: courses, count } = await query

  const totalPages = Math.ceil((count || 0) / limit)

  // 통계
  const { count: publishedCount } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PUBLISHED')

  const { count: draftCount } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'DRAFT')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">코스 관리</h1>
            <p className="text-gray-600 mt-2">모든 코스를 관리하고 검토할 수 있습니다</p>
          </div>
          <Link href="/instructor/courses/new" className="btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            새 코스 만들기
          </Link>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-soft p-4">
            <p className="text-sm text-gray-600">전체 코스</p>
            <p className="text-2xl font-bold text-gray-900">{count || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-soft p-4">
            <p className="text-sm text-gray-600">공개된 코스</p>
            <p className="text-2xl font-bold text-gray-900">{publishedCount || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-soft p-4">
            <p className="text-sm text-gray-600">임시저장</p>
            <p className="text-2xl font-bold text-gray-900">{draftCount || 0}</p>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
          <form className="flex flex-col md:flex-row gap-4">
            {/* 검색 */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  defaultValue={searchParams.search}
                  placeholder="코스명으로 검색"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* 상태 필터 */}
            <select
              name="status"
              defaultValue={searchParams.status}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">전체 상태</option>
              <option value="PUBLISHED">공개됨</option>
              <option value="DRAFT">임시저장</option>
            </select>

            {/* 카테고리 필터 */}
            <select
              name="category"
              defaultValue={searchParams.category}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">전체 카테고리</option>
              <option value="TRAINER">트레이너 교육</option>
              <option value="OPERATOR">운영자 교육</option>
              <option value="NUTRITION">영양 관리</option>
              <option value="BUSINESS">비즈니스</option>
            </select>

            {/* 검색 버튼 */}
            <button type="submit" className="btn-primary">
              검색
            </button>
          </form>
        </div>

        {/* 코스 테이블 */}
        <CourseTable courses={courses || []} />

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex space-x-2">
              {page > 1 && (
                <Link
                  href={`/admin/courses?page=${page - 1}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.status ? `&status=${searchParams.status}` : ''}${searchParams.category ? `&category=${searchParams.category}` : ''}`}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  이전
                </Link>
              )}
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Link
                    key={pageNum}
                    href={`/admin/courses?page=${pageNum}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.status ? `&status=${searchParams.status}` : ''}${searchParams.category ? `&category=${searchParams.category}` : ''}`}
                    className={`px-3 py-2 border rounded-lg ${
                      pageNum === page
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </Link>
                )
              })}
              
              {page < totalPages && (
                <Link
                  href={`/admin/courses?page=${page + 1}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.status ? `&status=${searchParams.status}` : ''}${searchParams.category ? `&category=${searchParams.category}` : ''}`}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  다음
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}