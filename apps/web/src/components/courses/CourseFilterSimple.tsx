import Link from 'next/link'

const categories = [
  { value: 'basic-knowledge', label: '기초 지식' },
  { value: 'certifications', label: '자격증' },
  { value: 'center-management', label: '센터 운영' },
  { value: 'special-populations', label: '특수 집단' },
  { value: 'nutrition-guidance', label: '영양 지도' },
]

const levels = [
  { value: 'beginner', label: '초급' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '고급' },
]

const priceTypes = [
  { value: 'free', label: '무료' },
  { value: 'paid', label: '유료' },
]

export default function CourseFilterSimple() {
  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">필터</h3>
      
      {/* 카테고리 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">카테고리</h4>
        <div className="space-y-2">
          <Link href="/courses" className="block text-sm text-gray-600 hover:text-primary-600">
            전체
          </Link>
          {categories.map((category) => (
            <Link
              key={category.value}
              href={`/courses?category=${category.value}`}
              className="block text-sm text-gray-600 hover:text-primary-600"
            >
              {category.label}
            </Link>
          ))}
        </div>
      </div>

      {/* 레벨 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">레벨</h4>
        <div className="space-y-2">
          <Link href="/courses" className="block text-sm text-gray-600 hover:text-primary-600">
            전체
          </Link>
          {levels.map((level) => (
            <Link
              key={level.value}
              href={`/courses?level=${level.value}`}
              className="block text-sm text-gray-600 hover:text-primary-600"
            >
              {level.label}
            </Link>
          ))}
        </div>
      </div>

      {/* 가격 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">가격</h4>
        <div className="space-y-2">
          <Link href="/courses" className="block text-sm text-gray-600 hover:text-primary-600">
            전체
          </Link>
          {priceTypes.map((price) => (
            <Link
              key={price.value}
              href={`/courses?price=${price.value}`}
              className="block text-sm text-gray-600 hover:text-primary-600"
            >
              {price.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}