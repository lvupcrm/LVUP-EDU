# 🛠️ 데이터베이스 설정 가이드

## 🚨 현재 상황
사용자가 회원가입을 해도 프로필이 자동으로 생성되지 않는 문제가 있습니다.

## ✅ 해결 순서

### 1단계: Database Trigger 설정 (Critical)

**Supabase Dashboard에서 실행해야 할 SQL:**

```sql
-- ================================================
-- 🔧 최종 트리거 수정 - 회원가입 시 프로필 자동 생성
-- ================================================

-- 1단계: 기존 트리거 완전 제거
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2단계: 새로운 강력한 트리거 함수 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- 최고 권한으로 설정 (RLS 우회)
  PERFORM set_config('role', 'service_role', true);
  PERFORM set_config('request.jwt.claims', '{"role":"service_role"}', true);
  
  -- 로그 출력 (디버깅용)
  RAISE LOG 'Starting profile creation for user: % (ID: %)', NEW.email, NEW.id;
  
  -- users 테이블에 프로필 생성
  INSERT INTO public.users (
    id, 
    email, 
    name, 
    avatar, 
    role,
    user_type,
    created_at, 
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name', 
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar',
    'STUDENT',
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'TRAINER'),
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    updated_at = NOW();
  
  RAISE LOG 'Profile created/updated successfully for user: %', NEW.email;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 상세한 오류 로그
    RAISE LOG 'Profile creation failed for user % (ID: %) with error: %', NEW.email, NEW.id, SQLERRM;
    -- 회원가입은 계속 진행하도록 함
    RETURN NEW;
END;
$$;

-- 3단계: 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 4단계: 함수 권한 설정
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
```

### 2단계: RLS 보안 정책 재활성화

```sql
-- ================================================
-- 🚨 긴급 보안 수정 - RLS 재활성화 및 기본 정책 설정
-- ================================================

-- 1단계: 핵심 테이블 RLS 재활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2단계: users 테이블 기본 보안 정책
-- 기존 정책 제거
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

-- Service Role은 모든 작업 가능 (시스템 운영용)
CREATE POLICY "Service role full access" ON public.users
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 3단계: courses 테이블 정책
CREATE POLICY "Anyone can view published courses" ON public.courses
    FOR SELECT
    USING (status = 'PUBLISHED');

-- 4단계: orders 테이블 정책  
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- 5단계: enrollments 테이블 정책
CREATE POLICY "Users can view own enrollments" ON public.enrollments
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
```

## 🔍 실행 방법

### Supabase Dashboard에서:
1. **Dashboard 접속**: https://supabase.com/dashboard
2. **프로젝트 선택**
3. **SQL Editor** 메뉴 클릭
4. **위 SQL 코드 복사/붙여넣기**
5. **Run 버튼 클릭**

### 검증 방법:
1. **트리거 확인**:
   ```sql
   SELECT trigger_name, event_manipulation, action_timing
   FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```

2. **함수 확인**:
   ```sql
   SELECT proname as function_name, prosecdef as security_definer
   FROM pg_proc 
   WHERE proname = 'handle_new_user';
   ```

3. **RLS 상태 확인**:
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename IN ('users', 'courses', 'orders', 'enrollments');
   ```

## ✅ 예상 결과

설정 완료 후:
- ✅ 회원가입 시 자동으로 `public.users` 프로필 생성
- ✅ 이메일 인증 여부와 관계없이 프로필 존재
- ✅ 보안 정책으로 데이터 보호
- ✅ 완전한 사용자 인증 플로우

## 🚨 주의사항
- SQL은 순서대로 실행해주세요
- 에러가 발생하면 로그를 확인해주세요
- 설정 후 반드시 회원가입 테스트를 해주세요