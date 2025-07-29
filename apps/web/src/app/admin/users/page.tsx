import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import UserTable from '@/components/admin/UserTable'

interface PageProps {
  searchParams: {
    search?: string
    role?: string
    status?: string
    page?: string
  }
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  // 사용자 목록 쿼리
  let query = supabase
    .from('users')
    .select(`
      *,
      enrollments:enrollments(count),
      orders:orders(count),
      instructors:instructors(id)
    `, { count: 'exact' })

  // 검색 필터
  if (searchParams.search) {
    query = query.or(`name.ilike.%${searchParams.search}%,email.ilike.%${searchParams.search}%`)
  }

  // 역할 필터
  if (searchParams.role === 'instructor') {
    query = query.not('instructors', 'is', null)
  } else if (searchParams.role === 'student') {
    query = query.is('instructors', null)
  }

  // 페이지네이션
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data: users, count } = await query

  const totalPages = Math.ceil((count || 0) / limit)

  // 통계
  const { data: stats } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { data: instructorCount } = await supabase
    .from('instructors')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
          <p className="text-gray-600 mt-2">전체 사용자를 관리하고 검색할 수 있습니다</p>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-soft p-4">
            <p className="text-sm text-gray-600">전체 사용자</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.count || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-soft p-4">
            <p className="text-sm text-gray-600">수강생</p>
            <p className="text-2xl font-bold text-gray-900">
              {(stats?.count || 0) - (instructorCount?.count || 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-soft p-4">
            <p className="text-sm text-gray-600">강사</p>
            <p className="text-2xl font-bold text-gray-900">{instructorCount?.count || 0}</p>
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
                  placeholder="이름 또는 이메일로 검색"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* 역할 필터 */}
            <select
              name="role"
              defaultValue={searchParams.role}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">전체 역할</option>
              <option value="student">수강생</option>
              <option value="instructor">강사</option>
            </select>

            {/* 검색 버튼 */}
            <button type="submit" className="btn-primary">
              검색
            </button>
          </form>
        </div>

        {/* 사용자 테이블 */}
        <UserTable users={users || []} />

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex space-x-2">
              {page > 1 && (
                <Link
                  href={`/admin/users?page=${page - 1}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.role ? `&role=${searchParams.role}` : ''}`}
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
                    href={`/admin/users?page=${pageNum}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.role ? `&role=${searchParams.role}` : ''}`}
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
                  href={`/admin/users?page=${page + 1}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.role ? `&role=${searchParams.role}` : ''}`}
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