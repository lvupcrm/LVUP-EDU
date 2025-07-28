'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'

interface CourseFilterProps {
  filters: {
    category: string
    level: string
    isPaid: string
    search: string
  }
  onFilterChange: (filters: any) => void
  onClearFilters: () => void
}

const categories = [
  { value: '기초 지식', label: '기초 지식' },
  { value: '전문 기술', label: '전문 기술' },
  { value: '자격증', label: '자격증' },
  { value: '경영 관리', label: '경영 관리' },
  { value: '마케팅', label: '마케팅' },
  { value: '운영', label: '운영' },
  { value: '리더십', label: '리더십' },
  { value: '고객 관리', label: '고객 관리' },
  { value: '개인 브랜딩', label: '개인 브랜딩' },
  { value: '비즈니스', label: '비즈니스' },
  { value: '창업', label: '창업' },
  { value: '브랜딩', label: '브랜딩' },
]

const levels = [
  { value: '초급', label: '초급' },
  { value: '중급', label: '중급' },
  { value: '고급', label: '고급' },
]

const priceTypes = [
  { value: 'false', label: '무료' },
  { value: 'true', label: '유료' },
]

export default function CourseFilter({ filters, onFilterChange, onClearFilters }: CourseFilterProps) {
  const hasActiveFilters = filters.category || filters.level || filters.isPaid

  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">필터</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            초기화
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">카테고리</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category.value} className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value={category.value}
                  checked={filters.category === category.value}
                  onChange={(e) => onFilterChange({ category: e.target.value })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{category.label}</span>
              </label>
            ))}
            <label className="flex items-center">
              <input
                type="radio"
                name="category"
                value=""
                checked={filters.category === ''}
                onChange={(e) => onFilterChange({ category: e.target.value })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">전체</span>
            </label>
          </div>
        </div>

        {/* Level Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">난이도</h4>
          <div className="space-y-2">
            {levels.map((level) => (
              <label key={level.value} className="flex items-center">
                <input
                  type="radio"
                  name="level"
                  value={level.value}
                  checked={filters.level === level.value}
                  onChange={(e) => onFilterChange({ level: e.target.value })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{level.label}</span>
              </label>
            ))}
            <label className="flex items-center">
              <input
                type="radio"
                name="level"
                value=""
                checked={filters.level === ''}
                onChange={(e) => onFilterChange({ level: e.target.value })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">전체</span>
            </label>
          </div>
        </div>

        {/* Price Type Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">가격</h4>
          <div className="space-y-2">
            {priceTypes.map((type) => (
              <label key={type.value} className="flex items-center">
                <input
                  type="radio"
                  name="isPaid"
                  value={type.value}
                  checked={filters.isPaid === type.value}
                  onChange={(e) => onFilterChange({ isPaid: e.target.value })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
            <label className="flex items-center">
              <input
                type="radio"
                name="isPaid"
                value=""
                checked={filters.isPaid === ''}
                onChange={(e) => onFilterChange({ isPaid: e.target.value })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">전체</span>
            </label>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">빠른 필터</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange({ isPaid: 'false' })}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filters.isPaid === 'false'
                ? 'bg-primary-100 text-primary-700 border-primary-200'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            무료 강의
          </button>
          <button
            onClick={() => onFilterChange({ level: '초급' })}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filters.level === '초급'
                ? 'bg-primary-100 text-primary-700 border-primary-200'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            초급자용
          </button>
          <button
            onClick={() => onFilterChange({ category: '자격증' })}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filters.category === '자격증'
                ? 'bg-primary-100 text-primary-700 border-primary-200'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            자격증
          </button>
        </div>
      </div>
    </div>
  )
}