'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import CourseCard from '@/components/courses/CourseCard'
import CourseFilter from '@/components/courses/CourseFilter'

interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  category: string
  level: string
  duration: number
  price: number
  isPaid: boolean
  rating: number
  instructor: {
    id: string
    name: string
    avatar: string
  }
  _count: {
    enrollments: number
    reviews: number
  }
}

interface CoursesResponse {
  courses: Course[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  })
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    isPaid: '',
    search: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const fetchCourses = async (params: any = {}) => {
    setLoading(true)
    try {
      const searchParams = new URLSearchParams()
      
      if (params.category) searchParams.append('category', params.category)
      if (params.level) searchParams.append('level', params.level)
      if (params.isPaid !== '') searchParams.append('isPaid', params.isPaid)
      if (params.search) searchParams.append('search', params.search)
      if (params.page) searchParams.append('page', params.page.toString())
      searchParams.append('limit', pagination.limit.toString())

      const response = await fetch(`http://localhost:8000/api/v1/courses?${searchParams}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data: CoursesResponse = await response.json()
        setCourses(data.courses)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses({ ...filters, page: 1 })
  }, [filters])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCourses({ ...filters, page: 1 })
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handlePageChange = (page: number) => {
    fetchCourses({ ...filters, page })
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      level: '',
      isPaid: '',
      search: '',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎯 전문 강의 둘러보기
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              피트니스 업계 최고 전문가들의 실무 중심 강의로 성장하세요
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="관심 있는 강의를 검색해보세요..."
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <div className="btn-primary px-4 py-2 text-sm">
                  검색
                </div>
              </button>
            </div>
          </form>

          {/* Filter Toggle */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              필터
              {(filters.category || filters.level || filters.isPaid) && (
                <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                  적용됨
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <CourseFilter
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-600">
                  총 <span className="font-semibold text-primary-600">{pagination.total}</span>개의 강의
                </p>
              </div>
              
              <select className="select">
                <option value="newest">최신순</option>
                <option value="popular">인기순</option>
                <option value="rating">평점순</option>
                <option value="price-low">가격 낮은순</option>
                <option value="price-high">가격 높은순</option>
              </select>
            </div>

            {/* Course Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-soft overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : courses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center">
                    <nav className="flex items-center space-x-2">
                      {pagination.page > 1 && (
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          이전
                        </button>
                      )}
                      
                      {[...Array(pagination.totalPages)].map((_, i) => {
                        const page = i + 1
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              page === pagination.page
                                ? 'bg-primary-500 text-white'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })}
                      
                      {pagination.page < pagination.totalPages && (
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          다음
                        </button>
                      )}
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-gray-600 mb-4">
                  다른 키워드로 검색하거나 필터를 조정해보세요
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-outline"
                >
                  필터 초기화
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}