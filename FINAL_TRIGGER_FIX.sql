-- ================================================
-- 🔧 최종 트리거 수정 - 회원가입 시 프로필 자동 생성
-- ================================================
-- 
-- 📋 실행 방법:
-- 1. Supabase Dashboard → SQL Editor
-- 2. 이 코드 전체 복사/붙여넣기
-- 3. Run 버튼 클릭
--
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

-- 5단계: 트리거 상태 확인
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 6단계: 함수 확인
SELECT 
  proname as function_name,
  prosecdef as security_definer
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 완료 메시지
SELECT 
  '🎉 트리거 재생성 완료!' as status,
  '새로운 회원가입 시 프로필이 자동으로 생성됩니다.' as message,
  NOW() as completed_at;