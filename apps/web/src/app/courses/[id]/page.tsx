'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  StarIcon, 
  ClockIcon, 
  UserGroupIcon, 
  PlayIcon,
  CheckIcon,
  BookOpenIcon,
  AcademicCapIcon,
  HeartIcon,
  ShareIcon,
} from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon, HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline'

interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  category: {
    id: string
    name: string
    slug: string
  }
  level: string
  duration: number
  price: number
  originalPrice?: number
  isFree: boolean
  averageRating: number
  instructor: {
    user: {
      id: string
      name: string
      avatar: string
      specialties: string
    }
    bio: string
    expertise: string
    achievements: string
  }
  lessons: {
    id: string
    title: string
    duration: number
    order: number
    isPreview: boolean
  }[]
  _count: {
    enrollments: number
    reviews: number
  }
}

export default function CourseDetailPage() {
  const params = useParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchCourse(params.id as string)
    }
  }, [params.id])

  const fetchCourse = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/courses/${id}`)
      if (response.ok) {
        const data = await response.json()
        setCourse(data)
      }
    } catch (error) {
      console.error('Failed to fetch course:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}시간 ${mins > 0 ? `${mins}분` : ''}`
    }
    return `${mins}분`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon key={`full-${i}`} className="h-5 w-5 text-yellow-400" />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <StarIcon key="half" className="h-5 w-5 text-yellow-400" />
      )
    }

    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarOutlineIcon key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
      )
    }

    return stars
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6">
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">강의를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">요청하신 강의가 존재하지 않거나 삭제되었습니다.</p>
          <Link href="/courses" className="btn-primary">
            강의 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary-600">홈</Link>
            <span>/</span>
            <Link href="/courses" className="hover:text-primary-600">강의</Link>
            <span>/</span>
            <span className="text-gray-900">{course.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  {course.category.name}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {course.level}
                </span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-6">
                {course.description}
              </p>

              {/* Instructor Info */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-fitness-500 rounded-full flex items-center justify-center mr-4">
                    {course.instructor.user.avatar ? (
                      <Image
                        src={course.instructor.user.avatar}
                        alt={course.instructor.user.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-white font-medium">
                        {course.instructor.user.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{course.instructor.user.name}</p>
                    <p className="text-sm text-gray-600">{course.instructor.user.specialties}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {isWishlisted ? (
                      <HeartIcon className="h-5 w-5 text-red-500" />
                    ) : (
                      <HeartOutlineIcon className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-sm">위시리스트</span>
                  </button>
                  
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <ShareIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm">공유</span>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {renderStars(course.averageRating)}
                  </div>
                  <span className="font-medium text-gray-900">
                    {course.averageRating.toFixed(1)}
                  </span>
                  <span>({course._count.reviews}개 리뷰)</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <UserGroupIcon className="h-4 w-4" />
                  {course._count.enrollments}명 수강
                </div>
                
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  {formatDuration(course.duration)}
                </div>
              </div>
            </div>

            {/* Course Video/Thumbnail */}
            <div className="relative mb-8">
              <div className="relative h-64 lg:h-96 bg-gradient-to-br from-primary-100 to-fitness-100 rounded-xl overflow-hidden">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PlayIcon className="w-20 h-20 text-primary-400" />
                  </div>
                )}
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all">
                    <PlayIcon className="w-8 h-8 text-primary-600 ml-1" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  {[
                    { key: 'overview', label: '강의 소개', icon: BookOpenIcon },
                    { key: 'curriculum', label: '커리큘럼', icon: AcademicCapIcon },
                    { key: 'instructor', label: '강사 소개', icon: UserGroupIcon },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.key
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="py-6">
                {activeTab === 'overview' && (
                  <div className="prose max-w-none">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">강의 개요</h3>
                    <p className="text-gray-700 leading-relaxed">{course.description}</p>
                    
                    <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">이런 분들께 추천해요</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>피트니스 업계에 입문하려는 분</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>체계적인 전문 지식을 쌓고 싶은 분</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>실무에 바로 적용할 수 있는 스킬을 원하는 분</span>
                      </li>
                    </ul>
                  </div>
                )}

                {activeTab === 'curriculum' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">커리큘럼</h3>
                    <div className="space-y-3">
                      {course.lessons.map((lesson, index) => (
                        <div key={lesson.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-medium text-primary-600">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <ClockIcon className="h-4 w-4" />
                                {formatDuration(lesson.duration)}
                                {lesson.isPreview && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                    미리보기
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {lesson.isPreview ? (
                            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                              미리보기
                            </button>
                          ) : (
                            <PlayIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'instructor' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">강사 소개</h3>
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-fitness-500 rounded-full flex items-center justify-center">
                          {course.instructor.user.avatar ? (
                            <Image
                              src={course.instructor.user.avatar}
                              alt={course.instructor.user.name}
                              width={64}
                              height={64}
                              className="rounded-full"
                            />
                          ) : (
                            <span className="text-white font-medium text-xl">
                              {course.instructor.user.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{course.instructor.user.name}</h4>
                          <p className="text-gray-600">{course.instructor.user.specialties}</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{course.instructor.bio}</p>
                      
                      {course.instructor.expertise && (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-900 mb-2">전문 분야</h5>
                          <div className="flex flex-wrap gap-2">
                            {JSON.parse(course.instructor.expertise).map((skill: string, index: number) => (
                              <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {course.instructor.achievements && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">주요 경력</h5>
                          <ul className="space-y-1">
                            {JSON.parse(course.instructor.achievements).map((achievement: string, index: number) => (
                              <li key={index} className="flex items-start gap-2 text-gray-700">
                                <CheckIcon className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Purchase Card */}
              <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
                <div className="text-center mb-6">
                  {course.isFree ? (
                    <div className="text-3xl font-bold text-green-600">무료</div>
                  ) : (
                    <div>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatPrice(course.price)}원
                      </div>
                      {course.originalPrice && course.originalPrice > course.price && (
                        <div className="text-lg text-gray-500 line-through">
                          {formatPrice(course.originalPrice)}원
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button className="btn-primary w-full text-lg py-3 mb-4">
                  {course.isFree ? '무료 수강하기' : '지금 수강하기'}
                </button>
                
                <button className="btn-outline w-full py-2 mb-4">
                  장바구니에 담기
                </button>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>수강 기간</span>
                    <span className="font-medium text-gray-900">무제한</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>동영상 시간</span>
                    <span className="font-medium text-gray-900">{formatDuration(course.duration)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>레슨 수</span>
                    <span className="font-medium text-gray-900">{course.lessons.length}개</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>수료증</span>
                    <span className="font-medium text-gray-900">제공</span>
                  </div>
                </div>
              </div>

              {/* Related Courses */}
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">관련 강의</h3>
                <div className="space-y-4">
                  {/* 관련 강의 목록은 나중에 API로 구현 */}
                  <div className="text-center text-gray-500 py-8">
                    관련 강의를 준비 중입니다
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}