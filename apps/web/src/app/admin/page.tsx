import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // 관리자 권한 확인
  const { data: isAdmin } = await supabase
    .rpc('is_admin', { user_id: user.id })

  if (!isAdmin) {
    redirect('/')
  }

  // 대시보드 통계 가져오기
  const { data: stats } = await supabase
    .from('admin_dashboard_stats')
    .select('*')
    .single()

  // 최근 주문 가져오기
  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      *,
      user:users(name, email),
      order_items(
        course:courses(title)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // 최근 등록 가져오기
  const { data: recentEnrollments } = await supabase
    .from('enrollments')
    .select(`
      *,
      user:users(name, email),
      course:courses(title)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // 인기 코스 가져오기
  const { data: popularCourses } = await supabase
    .from('courses')
    .select(`
      *,
      enrollments:enrollments(count),
      reviews:reviews(rating)
    `)
    .eq('status', 'PUBLISHED')
    .order('enrollments.count', { ascending: false })
    .limit(5)

  return (
    <AdminDashboard
      stats={stats || {}}
      recentOrders={recentOrders || []}
      recentEnrollments={recentEnrollments || []}
      popularCourses={popularCourses || []}
    />
  )
}