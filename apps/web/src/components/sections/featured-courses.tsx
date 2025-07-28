'use client'

import { useState } from 'react'
import Link from 'next/link'
import { StarIcon, ClockIcon, UsersIcon, PlayIcon } from '@heroicons/react/24/solid'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

// 샘플 데이터 (실제 환경에서는 API에서 가져옴)
const featuredCourses = [
  {
    id: 1,
    title: '피트니스 트레이너 기초 해부학',
    instructor: '김트레이너',
    instructorTitle: '15년 경력 • CPT/CES 보유',
    thumbnail: '/courses/anatomy-basic.jpg',
    category: '트레이너 교육',
    level: '초급',
    duration: 300, // 분
    studentCount: 1250,
    rating: 4.9,
    reviewCount: 234,
    price: 99000,
    originalPrice: 129000,
    discountRate: 23,
    description: '트레이너가 반드시 알아야 할 인체 해부학과 근육의 구조를 배우는 기초 과정',
    tags: ['해부학', '근육', '기초', '필수'],
    slug: 'fitness-trainer-basic-anatomy',
    isPopular: true,
  },
  {
    id: 2,
    title: '실전 퍼스널 트레이닝 프로그램 설계',
    instructor: '이코치',
    instructorTitle: '12년 경력 • NASM-CPT',
    thumbnail: '/courses/program-design.jpg',
    category: '트레이너 교육',
    level: '중급',
    duration: 480,
    studentCount: 890,
    rating: 4.8,
    reviewCount: 156,
    price: 149000,
    originalPrice: 199000,
    discountRate: 25,
    description: '개인별 맞춤 운동 프로그램을 설계하는 실무 중심 과정',
    tags: ['프로그램설계', '퍼스널', '실무'],
    slug: 'personal-training-program-design',
    isNew: true,
  },
  {
    id: 3,
    title: '피트니스 센터 창업부터 운영까지',
    instructor: '박사장',
    instructorTitle: '20년 경력 • 7개 센터 운영',
    thumbnail: '/courses/gym-management.jpg',
    category: '운영자 교육',
    level: '중급',
    duration: 600,
    studentCount: 567,
    rating: 4.9,
    reviewCount: 89,
    price: 199000,
    originalPrice: 249000,
    discountRate: 20,
    description: '센터 창업 준비부터 성공적인 운영까지 모든 것을 다루는 종합 과정',
    tags: ['창업', '운영', '경영', '마케팅'],
    slug: 'gym-startup-management',
    isBest: true,
  },
  {
    id: 4,
    title: '재활 운동 전문가 양성 과정',
    instructor: '정물리치료사',
    instructorTitle: '물리치료사 • CES 보유',
    thumbnail: '/courses/rehabilitation.jpg',
    category: '트레이너 교육',
    level: '고급',
    duration: 720,
    studentCount: 234,
    rating: 4.9,
    reviewCount: 67,
    price: 249000,
    originalPrice: 299000,
    discountRate: 17,
    description: '부상 회복과 재활을 위한 전문적인 운동 처방법을 학습',
    tags: ['재활', '부상회복', '전문과정'],
    slug: 'rehabilitation-exercise-specialist',
    isExpert: true,
  }
]

const tabs = [
  { id: 'all', name: '전체', count: featuredCourses.length },
  { id: 'trainer', name: '트레이너', count: featuredCourses.filter(c => c.category === '트레이너 교육').length },
  { id: 'operator', name: '운영자', count: featuredCourses.filter(c => c.category === '운영자 교육').length },
]

export function FeaturedCourses() {
  const [activeTab, setActiveTab] = useState('all')

  const filteredCourses = featuredCourses.filter(course => {
    if (activeTab === 'all') return true
    if (activeTab === 'trainer') return course.category === '트레이너 교육'
    if (activeTab === 'operator') return course.category === '운영자 교육'
    return true
  })

  return (
    <section className="section bg-white">
      <div className="container">
        {/* 헤더 */}
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            <span className="text-gradient">인기 강의</span>로 시작하는 전문 교육
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            수강생들이 가장 많이 선택하고 높은 만족도를 보이는 강의들을 만나보세요
          </p>
        </div>

        {/* 탭 필터 */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-gray-100 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* 강의 그리드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {filteredCourses.map((course) => (
            <Link 
              key={course.id}
              href={`/courses/${course.slug}`}
              className="group"
            >
              <div className="card-hover">
                {/* 썸네일 */}
                <div className="relative aspect-video bg-gray-200 rounded-t-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {course.isPopular && (
                      <span className="badge-fitness text-xs">인기</span>
                    )}
                    {course.isNew && (
                      <span className="badge-primary text-xs">신규</span>
                    )}
                    {course.isBest && (
                      <span className="badge-success text-xs">베스트</span>
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <PlayIcon className="w-5 h-5 text-gray-700 ml-0.5" />
                    </div>
                  </div>
                  {/* 실제 환경에서는 이미지 사용 */}
                  <div className="w-full h-full bg-gradient-to-br from-primary-200 to-fitness-200" />
                </div>

                {/* 콘텐츠 */}
                <div className="p-4 space-y-3">
                  {/* 카테고리 & 레벨 */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-primary-600 font-medium">{course.category}</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">{course.level}</span>
                  </div>

                  {/* 제목 */}
                  <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {course.title}
                  </h3>

                  {/* 강사 정보 */}
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">{course.instructor}</div>
                    <div className="text-xs">{course.instructorTitle}</div>
                  </div>

                  {/* 통계 */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-3 h-3 text-yellow-400" />
                      <span className="font-medium text-gray-700">{course.rating}</span>
                      <span>({course.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UsersIcon className="w-3 h-3" />
                      <span>{course.studentCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      <span>{Math.floor(course.duration / 60)}h</span>
                    </div>
                  </div>

                  {/* 가격 */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="space-y-1">
                      {course.discountRate > 0 && (
                        <div className="text-xs text-gray-500 line-through">
                          ₩{course.originalPrice.toLocaleString()}
                        </div>
                      )}
                      <div className="text-lg font-bold text-gray-900">
                        ₩{course.price.toLocaleString()}
                      </div>
                    </div>
                    {course.discountRate > 0 && (
                      <div className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded">
                        {course.discountRate}% 할인
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/courses"
            className="btn-outline text-lg px-8 py-3 group"
          >
            모든 강의 보기
            <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}