-- 관리자 역할 테이블
CREATE TABLE public.admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 인덱스
CREATE INDEX idx_admin_roles_user_id ON public.admin_roles(user_id);
CREATE INDEX idx_admin_roles_role ON public.admin_roles(role);

-- RLS 정책
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- 관리자만 조회 가능
CREATE POLICY "Admins can view admin roles" ON public.admin_roles
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.admin_roles
    )
  );

-- 관리자 여부 확인 함수
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE admin_roles.user_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Super Admin 여부 확인 함수
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE admin_roles.user_id = $1
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 관리자 대시보드 통계 뷰
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.users WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_users_week,
  (SELECT COUNT(*) FROM public.courses WHERE status = 'PUBLISHED') as total_courses,
  (SELECT COUNT(*) FROM public.enrollments) as total_enrollments,
  (SELECT COUNT(*) FROM public.enrollments WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_enrollments_week,
  (SELECT COUNT(*) FROM public.orders WHERE status = 'COMPLETED') as total_orders,
  (SELECT COALESCE(SUM(amount), 0) FROM public.orders WHERE status = 'COMPLETED') as total_revenue,
  (SELECT COALESCE(SUM(amount), 0) FROM public.orders WHERE status = 'COMPLETED' AND created_at >= CURRENT_DATE - INTERVAL '30 days') as revenue_month,
  (SELECT COUNT(*) FROM public.instructors) as total_instructors,
  (SELECT COUNT(*) FROM public.reviews) as total_reviews,
  (SELECT AVG(rating) FROM public.reviews) as average_rating,
  (SELECT COUNT(*) FROM public.certificates) as total_certificates;

-- 관리자만 통계 조회 가능
CREATE POLICY "Admins can view dashboard stats" ON public.courses
  FOR SELECT
  USING (is_admin());

-- 코스 관리 정책 업데이트 (관리자는 모든 코스 수정 가능)
CREATE POLICY "Admins can update all courses" ON public.courses
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete all courses" ON public.courses
  FOR DELETE
  USING (is_admin());

-- 사용자 관리 정책 (관리자는 사용자 정보 조회 가능)
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT
  USING (is_admin());

-- 주문 관리 정책 (관리자는 모든 주문 조회 가능)
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT
  USING (is_admin());

-- 등록 관리 정책 (관리자는 모든 등록 조회 가능)
CREATE POLICY "Admins can view all enrollments" ON public.enrollments
  FOR SELECT
  USING (is_admin());