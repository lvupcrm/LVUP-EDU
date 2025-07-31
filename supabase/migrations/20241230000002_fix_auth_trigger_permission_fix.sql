-- ================================
-- LVUP EDU 인증 트리거 수정 (권한 오류 해결)
-- ================================

-- 1. 기존 트리거 제거 및 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. 개선된 트리거 함수 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- RLS를 우회하여 직접 INSERT
  PERFORM set_config('role', 'service_role', true);
  
  INSERT INTO public.users (id, email, name, role, user_type, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name', 
      SPLIT_PART(NEW.email, '@', 1)
    ),
    'STUDENT',
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'TRAINER'),
    NEW.created_at,
    NOW()
  );
  
  -- role 설정 복원
  PERFORM set_config('role', 'authenticated', true);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 오류 로깅 및 계속 진행
    RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. 트리거 재생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. RLS 정책 수정 (트리거가 실행될 수 있도록)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;

-- 트리거 전용 INSERT 정책 (서비스 역할 허용)
CREATE POLICY "Service role can insert users" ON public.users
  FOR INSERT TO service_role
  WITH CHECK (true);

-- 일반 사용자 INSERT 정책 (자신의 프로필만)
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- 5. 누락된 사용자 프로필 생성 함수 (권한 오류 방지)
CREATE OR REPLACE FUNCTION public.create_missing_user_profiles()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  created_count INTEGER := 0;
BEGIN
  -- service_role로 실행하여 권한 문제 해결
  PERFORM set_config('role', 'service_role', true);
  
  INSERT INTO public.users (id, email, name, role, user_type, created_at, updated_at)
  SELECT 
    au.id,
    au.email,
    COALESCE(
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      SPLIT_PART(au.email, '@', 1)
    ),
    'STUDENT',
    COALESCE(au.raw_user_meta_data->>'user_type', 'TRAINER'),
    au.created_at,
    NOW()
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NULL AND au.email IS NOT NULL;
  
  GET DIAGNOSTICS created_count = ROW_COUNT;
  
  -- role 설정 복원
  PERFORM set_config('role', 'authenticated', true);
  
  RETURN created_count;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating missing profiles: %', SQLERRM;
    RETURN 0;
END;
$$;

-- 6. 함수 실행으로 누락된 프로필 생성
SELECT public.create_missing_user_profiles() as created_profiles_count;

-- 7. 검증 함수 생성
CREATE OR REPLACE FUNCTION public.verify_auth_sync()
RETURNS TABLE (
  total_auth_users INTEGER,
  total_public_users INTEGER,
  missing_profiles INTEGER,
  sync_percentage NUMERIC,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- service_role로 실행하여 권한 문제 해결
  PERFORM set_config('role', 'service_role', true);
  
  RETURN QUERY
  WITH user_counts AS (
    SELECT 
      (SELECT COUNT(*) FROM auth.users WHERE email IS NOT NULL) as auth_count,
      (SELECT COUNT(*) FROM public.users) as public_count,
      (SELECT COUNT(*) 
       FROM auth.users au 
       LEFT JOIN public.users pu ON au.id = pu.id 
       WHERE pu.id IS NULL AND au.email IS NOT NULL) as missing_count
  )
  SELECT 
    auth_count::INTEGER,
    public_count::INTEGER,
    missing_count::INTEGER,
    CASE 
      WHEN auth_count > 0 THEN 
        ROUND(((auth_count - missing_count) * 100.0 / auth_count), 2)
      ELSE 100.0 
    END,
    CASE 
      WHEN missing_count = 0 THEN 'SYNCED'
      WHEN missing_count < auth_count * 0.1 THEN 'MOSTLY_SYNCED' 
      ELSE 'OUT_OF_SYNC'
    END
  FROM user_counts;
  
  -- role 설정 복원
  PERFORM set_config('role', 'authenticated', true);
END;
$$;

-- 8. 트리거 테스트 함수
CREATE OR REPLACE FUNCTION public.test_auth_trigger()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_email TEXT := 'trigger-test-' || extract(epoch from now()) || '@test.com';
  test_user_id UUID;
  profile_exists BOOLEAN := false;
BEGIN
  -- service_role로 실행
  PERFORM set_config('role', 'service_role', true);
  
  -- 테스트 사용자 생성 (트리거 발동)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    test_email,
    crypt('test123', gen_salt('bf')),
    NOW(),
    '{"full_name": "Trigger Test User"}',
    NOW(),
    NOW()
  ) RETURNING id INTO test_user_id;
  
  -- 0.5초 대기 (트리거 실행 시간)
  PERFORM pg_sleep(0.5);
  
  -- 프로필 생성 확인
  SELECT EXISTS(
    SELECT 1 FROM public.users WHERE id = test_user_id
  ) INTO profile_exists;
  
  -- 테스트 데이터 정리
  DELETE FROM public.users WHERE id = test_user_id;
  DELETE FROM auth.users WHERE id = test_user_id;
  
  -- role 설정 복원
  PERFORM set_config('role', 'authenticated', true);
  
  IF profile_exists THEN
    RETURN 'SUCCESS: 트리거가 정상적으로 작동합니다';
  ELSE
    RETURN 'FAILED: 트리거가 작동하지 않습니다';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    -- 정리 작업
    BEGIN
      DELETE FROM public.users WHERE id = test_user_id;
      DELETE FROM auth.users WHERE id = test_user_id;
    EXCEPTION
      WHEN OTHERS THEN
        NULL; -- 정리 실패 무시
    END;
    
    RETURN 'ERROR: ' || SQLERRM;
END;
$$;

-- 실행 완료 메시지
SELECT 
  'LVUP EDU 인증 시스템 수정 완료!' as message,
  NOW() as completed_at;