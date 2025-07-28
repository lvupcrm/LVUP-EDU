import Link from 'next/link'
import { StarIcon, AcademicCapIcon } from '@heroicons/react/24/solid'

const instructors = [
  {
    id: 1,
    name: '김트레이너',
    title: '피트니스 전문가',
    experience: '15년 경력',
    specialties: ['웨이트 트레이닝', '재활 운동', '다이어트'],
    certifications: ['CPT', 'CES', 'PES'],
    students: 1250,
    courses: 8,
    rating: 4.9,
    avatar: '/instructors/kim-trainer.jpg',
    description: '대한민국 최고의 피트니스 전문가로서 수많은 고객들의 변화를 이끌어왔습니다.',
  },
  {
    id: 2,
    name: '박사장',
    title: '센터 운영 전문가',
    experience: '20년 경력',
    specialties: ['센터 운영', '마케팅', '브랜드화'],
    certifications: ['MBA', '피트니스 경영 전문가'],
    students: 567,
    courses: 5,
    rating: 4.9,
    avatar: '/instructors/park-ceo.jpg',
    description: '7개 센터를 성공적으로 운영하며 피트니스 업계 발전에 기여하고 있습니다.',
  },
  {
    id: 3,
    name: '정물리치료사',
    title: '재활 운동 전문가',
    experience: '12년 경력',
    specialties: ['재활 운동', '부상 예방', '스포츠 물리치료'],
    certifications: ['물리치료사', 'CES', 'CSCS'],
    students: 234,
    courses: 3,
    rating: 4.9,
    avatar: '/instructors/jung-pt.jpg',
    description: '스포츠 의학과 재활 운동의 전문가로 안전하고 효과적인 운동을 지도합니다.',
  },
]

export function InstructorSection() {
  return (
    <section className="section bg-gray-50">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            <span className="text-gradient">현장 전문가</span>들이 직접 가르칩니다
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            수년간의 실무 경험과 검증된 전문성을 바탕으로 
            실전에서 바로 활용할 수 있는 노하우를 전수합니다
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {instructors.map((instructor) => (
            <div key={instructor.id} className="card-hover bg-white text-center">
              <div className="p-6 space-y-4">
                {/* 아바타 */}
                <div className="relative mx-auto">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-400 to-fitness-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {instructor.name.charAt(0)}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <AcademicCapIcon className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* 정보 */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">{instructor.name}</h3>
                  <div className="text-primary-600 font-medium">{instructor.title}</div>
                  <div className="text-sm text-gray-600">{instructor.experience} • {instructor.certifications.join(', ')}</div>
                </div>

                {/* 설명 */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {instructor.description}
                </p>

                {/* 전문 분야 */}
                <div className="flex flex-wrap justify-center gap-2">
                  {instructor.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                {/* 통계 */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{instructor.students.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">수강생</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{instructor.courses}</div>
                    <div className="text-xs text-gray-600">강의</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <StarIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-lg font-bold text-gray-900">{instructor.rating}</span>
                    </div>
                    <div className="text-xs text-gray-600">평점</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/instructors"
            className="btn-primary text-lg px-8 py-3"
          >
            모든 강사진 보기
          </Link>
        </div>
      </div>
    </section>
  )
}