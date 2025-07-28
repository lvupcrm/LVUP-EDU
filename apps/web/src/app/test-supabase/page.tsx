import { supabase } from '@/lib/supabase'

export default async function TestSupabasePage() {
  // 카테고리 데이터 테스트
  const { data: categories, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .order('order_num')

  // 강의 데이터 테스트
  const { data: courses, error: courseError } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      level,
      price,
      is_free,
      enrollment_count,
      average_rating
    `)
    .eq('status', 'PUBLISHED')
    .limit(5)

  // 사용자 수 테스트
  const { count: userCount, error: userError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Supabase 연결 테스트</h1>
      
      <div className="space-y-6">
        {/* 연결 상태 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">연결 상태</h2>
          <p className="text-sm text-gray-600">
            Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}
          </p>
          <p className="text-sm text-gray-600">
            API Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...
          </p>
        </div>

        {/* 카테고리 테스트 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">카테고리 ({categories?.length || 0}개)</h2>
          {categoryError ? (
            <p className="text-red-600">에러: {categoryError.message}</p>
          ) : (
            <ul className="space-y-1">
              {categories?.map(cat => (
                <li key={cat.id} className="text-sm">
                  {cat.icon} {cat.name} ({cat.type})
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 강의 테스트 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">최근 강의</h2>
          {courseError ? (
            <p className="text-red-600">에러: {courseError.message}</p>
          ) : (
            <ul className="space-y-2">
              {courses?.map(course => (
                <li key={course.id} className="text-sm">
                  <div className="font-medium">{course.title}</div>
                  <div className="text-gray-600">
                    레벨: {course.level} | 
                    가격: {course.is_free ? '무료' : `${course.price.toLocaleString()}원`} |
                    수강생: {course.enrollment_count}명 |
                    평점: {course.average_rating}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 사용자 수 테스트 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">사용자 통계</h2>
          {userError ? (
            <p className="text-red-600">에러: {userError.message}</p>
          ) : (
            <p>총 사용자 수: {userCount || 0}명</p>
          )}
        </div>
      </div>
    </div>
  )
}