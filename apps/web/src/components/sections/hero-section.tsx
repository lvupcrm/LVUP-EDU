import Link from 'next/link'
import { ArrowRightIcon, PlayIcon } from '@heroicons/react/24/outline'

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-fitness-50 overflow-hidden">
      <div className="container section">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 좌측 콘텐츠 */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium">
                🎯 현장 전문가가 가르치는 실전 교육
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                <span className="text-gray-900">피트니스 업계</span>
                <br />
                <span className="text-gradient">성공의 길잡이</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                트레이너부터 센터 운영까지, 피트니스 종사자를 위한<br />
                <strong className="text-gray-900">실전 중심 전문 교육 플랫폼</strong>
              </p>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">5,000+</div>
                <div className="text-sm text-gray-600">수강생</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">200+</div>
                <div className="text-sm text-gray-600">강의</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">95%</div>
                <div className="text-sm text-gray-600">만족도</div>
              </div>
            </div>

            {/* CTA 버튼 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/courses"
                className="btn-fitness text-lg px-8 py-3 group"
              >
                강의 둘러보기
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="btn-outline text-lg px-8 py-3 group">
                <PlayIcon className="w-5 h-5 mr-2" />
                소개 영상 보기
              </button>
            </div>

            {/* 신뢰 지표 */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 bg-gradient-to-br from-primary-400 to-fitness-400 rounded-full border-2 border-white"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  1,000+ 현직 전문가들이 선택
                </span>
              </div>
            </div>
          </div>

          {/* 우측 이미지/영상 */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-primary-500 to-fitness-500 rounded-2xl p-1">
              <div className="bg-white rounded-xl p-6">
                {/* 강의 카드 미리보기 */}
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
                    <PlayIcon className="w-16 h-16 text-gray-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">
                      피트니스 트레이너 기초 과정
                    </h3>
                    <p className="text-sm text-gray-600">
                      김트레이너 • 15년 경력 전문가
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="flex text-yellow-400">
                          ⭐⭐⭐⭐⭐
                        </div>
                        <span className="text-sm text-gray-600">(4.9)</span>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">₹99,000</div>
                        <div className="text-sm text-gray-500 line-through">₹129,000</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 플로팅 배지들 */}
            <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-soft p-3 animate-bounce-gentle">
              <div className="text-center">
                <div className="text-sm font-bold text-primary-600">95%</div>
                <div className="text-xs text-gray-600">자격증 합격률</div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-soft p-3">
              <div className="text-center">
                <div className="text-sm font-bold text-fitness-600">24/7</div>
                <div className="text-xs text-gray-600">학습 지원</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 배경 장식 */}
      <div className="absolute top-0 right-0 -z-10 transform translate-x-1/2 -translate-y-1/2">
        <div className="w-96 h-96 rounded-full bg-gradient-to-br from-primary-200/50 to-fitness-200/50 blur-3xl" />
      </div>
      <div className="absolute bottom-0 left-0 -z-10 transform -translate-x-1/2 translate-y-1/2">
        <div className="w-80 h-80 rounded-full bg-gradient-to-tr from-fitness-200/50 to-primary-200/50 blur-3xl" />
      </div>
    </section>
  )
}