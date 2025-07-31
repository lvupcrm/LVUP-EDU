-- ================================================
-- 🚨 긴급 보안 수정 - RLS 재활성화 및 기본 정책 설정
-- ================================================
-- 
-- 📋 실행 방법:
-- 1. Supabase Dashboard → SQL Editor
-- 2. 이 코드 전체 복사/붙여넣기
-- 3. Run 버튼 클릭
-- 4. 웹사이트에서 정상 작동 확인
--
-- ================================================

-- 1단계: 핵심 테이블 RLS 재활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2단계: users 테이블 기본 보안 정책
-- 사용자는 본인 데이터만 접근, 모든 사용자 목록은 조회 가능 (필요시)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;

-- 인증된 사용자는 모든 사용자 기본 정보 조회 가능 (UI 표시용)
CREATE POLICY "Authenticated users can view basic user info" ON public.users
    FOR SELECT 
    TO authenticated
    USING (true);

-- 사용자는 본인 프로필만 수정 가능
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Service role은 모든 작업 가능 (트리거용)
CREATE POLICY "Service role can manage users" ON public.users
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 3단계: courses 테이블 정책 (공개 데이터)
DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;
DROP POLICY IF EXISTS "Authenticated can view courses" ON public.courses;

-- 모든 사용자가 코스 목록 조회 가능
CREATE POLICY "Anyone can view courses" ON public.courses
    FOR SELECT 
    USING (true);

-- 4단계: enrollments 테이블 정책 (개인 데이터)
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can create own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Service role can manage enrollments" ON public.enrollments;

-- 사용자는 본인 수강 내역만 조회 가능
CREATE POLICY "Users can view own enrollments" ON public.enrollments
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);

-- 사용자는 본인 수강 신청만 가능
CREATE POLICY "Users can create own enrollments" ON public.enrollments
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Service role은 모든 작업 가능
CREATE POLICY "Service role can manage enrollments" ON public.enrollments
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 5단계: orders 테이블 정책 (개인 데이터)
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can manage orders" ON public.orders;

-- 사용자는 본인 주문 내역만 조회 가능
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);

-- 사용자는 본인 주문만 생성 가능
CREATE POLICY "Users can create own orders" ON public.orders
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Service role은 모든 작업 가능
CREATE POLICY "Service role can manage orders" ON public.orders
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 6단계: 추가 테이블들 (있다면)
-- lessons 테이블 (공개 데이터)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'lessons') THEN
        ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Anyone can view lessons" ON public.lessons;
        CREATE POLICY "Anyone can view lessons" ON public.lessons
            FOR SELECT USING (true);
    END IF;
END $$;

-- notifications 테이블 (개인 데이터)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'notifications') THEN
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
        CREATE POLICY "Users can view own notifications" ON public.notifications
            FOR SELECT 
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- 7단계: 보안 상태 확인
SELECT 
    '=== RLS 재활성화 완료 ===' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename IN ('users', 'courses', 'enrollments', 'orders', 'lessons', 'notifications')
ORDER BY tablename;

-- 8단계: 정책 확인
SELECT 
    '=== 생성된 보안 정책 ===' as info,
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 완료 메시지
SELECT 
    '🛡️ 보안 강화 완료!' as status,
    '웹사이트 테스트 후 정상 작동 확인 필요' as next_step,
    NOW() as completed_at;