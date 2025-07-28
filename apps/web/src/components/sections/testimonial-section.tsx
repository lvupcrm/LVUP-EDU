import { StarIcon } from '@heroicons/react/24/solid'

const testimonials = [
  {
    id: 1,
    name: '이트레이너',
    role: '퍼스널 트레이너',
    company: '서울 • 3년 경력',
    content: '해부학 기초 과정을 수강한 후 고객 상담이 완전히 달라졌어요. 전문적인 설명으로 신뢰도가 확실히 높아졌습니다.',
    rating: 5,
    course: '피트니스 트레이너 기초 해부학',
    avatar: '/testimonials/lee-trainer.jpg',
  },
  {
    id: 2,
    name: '김사장',
    role: '센터 운영자',
    company: '부산 • 헬스장 운영',
    content: '창업 과정에서 배운 마케팅 전략을 적용한 결과, 3개월 만에 회원 수가 40% 증가했습니다. 정말 실무에 도움이 되네요.',
    rating: 5,
    course: '피트니스 센터 창업부터 운영까지',
    avatar: '/testimonials/kim-ceo.jpg',
  },
  {
    id: 3,
    name: '박관리자',
    role: '센터 매니저',
    company: '인천 • 대형 센터',
    content: '직원 관리와 고객 서비스 개선 방법을 배워서 센터 운영이 훨씬 체계적으로 바뀌었어요. 팀워크도 좋아졌습니다.',
    rating: 5,
    course: '조직 관리 및 리더십',
    avatar: '/testimonials/park-manager.jpg',
  },
]

export function TestimonialSection() {
  return (
    <section className="section bg-white">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            수강생들의 <span className="text-gradient">생생한 후기</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            실제 현장에서 적용하고 성과를 얻은 수강생들의 진솔한 이야기를 들어보세요
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="card-hover bg-white border border-gray-100">
              <div className="p-6 space-y-4">
                {/* 별점 */}
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>

                {/* 후기 내용 */}
                <blockquote className="text-gray-700 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>

                {/* 수강 강의 */}
                <div className="text-sm text-primary-600 font-medium">
                  📚 {testimonial.course}
                </div>

                {/* 작성자 정보 */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-fitness-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-xs text-gray-500">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 통계 */}
        <div className="mt-12 p-8 bg-gradient-to-r from-primary-50 to-fitness-50 rounded-2xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900">95%</div>
              <div className="text-sm text-gray-600">수강 만족도</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">88%</div>
              <div className="text-sm text-gray-600">자격증 합격률</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">92%</div>
              <div className="text-sm text-gray-600">취업/창업 성공률</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">4.8/5.0</div>
              <div className="text-sm text-gray-600">평균 평점</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}