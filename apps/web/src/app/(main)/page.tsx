import { HeroSection } from '@/components/sections/hero-section'
import { FeaturedCourses } from '@/components/sections/featured-courses'
import { CategorySection } from '@/components/sections/category-section'
import { InstructorSection } from '@/components/sections/instructor-section'
import { TestimonialSection } from '@/components/sections/testimonial-section'
import { StatsSection } from '@/components/sections/stats-section'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* 히어로 섹션 - 인프런 스타일 */}
      <HeroSection />
      
      {/* 통계 섹션 - 신뢰성 강조 */}
      <StatsSection />
      
      {/* 카테고리 섹션 - 트레이너/운영자 구분 */}
      <CategorySection />
      
      {/* 인기 강의 섹션 */}
      <FeaturedCourses />
      
      {/* 강사 소개 섹션 */}
      <InstructorSection />
      
      {/* 후기 섹션 */}
      <TestimonialSection />
    </main>
  )
}