import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 lg:pl-64">
          {children}
        </main>
      </div>
    </div>
  )
}