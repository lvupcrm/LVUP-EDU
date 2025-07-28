import Link from 'next/link'
import { 
  AcademicCapIcon, 
  BuildingOfficeIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline'

const categories = [
  {
    type: 'trainer',
    title: '트레이너 교육',
    description: '현장에서 바로 적용할 수 있는 실무 중심 트레이너 교육',
    icon: AcademicCapIcon,
    color: 'primary',
    stats: {
      courses: 120,
      students: 3200,
      rating: 4.8
    },
    subcategories: [
      { name: '기초 과정', count: 35, href: '/courses/trainer/basic' },
      { name: '실무 과정', count: 45, href: '/courses/trainer/practical' },
      { name: '전문 과정', count: 25, href: '/courses/trainer/advanced' },
      { name: '자격증 대비', count: 15, href: '/courses/trainer/certification' },
    ],
    href: '/courses/trainer',
    bgGradient: 'from-primary-500 to-primary-600',
    badgeColor: 'bg-primary-100 text-primary-700',
  },
  {
    type: 'operator',
    title: '운영자 교육',
    description: '피트니스 센터 운영부터 브랜드화까지 경영 전문 교육',
    icon: BuildingOfficeIcon,
    color: 'fitness',
    stats: {
      courses: 80,
      students: 1800,
      rating: 4.9
    },
    subcategories: [
      { name: '기초 운영', count: 20, href: '/courses/operator/basic' },
      { name: '매출 관리', count: 25, href: '/courses/operator/revenue' },
      { name: '조직 관리', count: 20, href: '/courses/operator/organization' },
      { name: '고급 전략', count: 15, href: '/courses/operator/strategy' },
    ],
    href: '/courses/operator',
    bgGradient: 'from-fitness-500 to-fitness-600',
    badgeColor: 'bg-fitness-100 text-fitness-700',
  }
]

export function CategorySection() {
  return (
    <section className="section bg-gray-50">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            당신의 성장 단계에 맞는 <span className="text-gradient">전문 교육</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            트레이너와 운영자 각각의 니즈에 최적화된 실무 중심 커리큘럼으로 
            피트니스 업계 성공의 길을 안내합니다.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {categories.map((category) => {
            const IconComponent = category.icon
            
            return (
              <div
                key={category.type}
                className="group card-hover bg-white border-0 shadow-soft"
              >
                {/* 헤더 */}
                <div className={`bg-gradient-to-r ${category.bgGradient} p-6 text-white`}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${category.badgeColor}`}>
                          인기
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold">{category.title}</h3>
                      <p className="text-white/90 leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  {/* 통계 */}
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
                    <div className="text-center">
                      <div className="text-lg font-bold">{category.stats.courses}+</div>
                      <div className="text-xs text-white/80">강의</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{category.stats.students.toLocaleString()}+</div>
                      <div className="text-xs text-white/80">수강생</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{category.stats.rating}</div>
                      <div className="text-xs text-white/80">평점</div>
                    </div>
                  </div>
                </div>

                {/* 서브카테고리 */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {category.subcategories.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group/sub"
                      >
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {sub.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {sub.count}개 강의
                          </div>
                        </div>
                        <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover/sub:text-gray-600 group-hover/sub:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link
                    href={category.href}
                    className={`block w-full text-center py-3 px-4 rounded-lg font-medium transition-colors ${
                      category.color === 'primary'
                        ? 'bg-primary-500 hover:bg-primary-600 text-white'
                        : 'bg-fitness-500 hover:bg-fitness-600 text-white'
                    } group/cta`}
                  >
                    모든 강의 보기
                    <ArrowRightIcon className="inline w-4 h-4 ml-2 group-hover/cta:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* 추가 정보 */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-6 p-6 bg-white rounded-xl shadow-soft">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">무료 체험</div>
              <div className="text-sm text-gray-600">각 과정 첫 강의</div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">수료증 발급</div>
              <div className="text-sm text-gray-600">과정 완료시</div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">평생 수강</div>
              <div className="text-sm text-gray-600">언제든 복습 가능</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}