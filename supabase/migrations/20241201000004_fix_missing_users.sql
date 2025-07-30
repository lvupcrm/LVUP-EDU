-- ================================
-- 누락된 사용자 프로필 수정 및 트리거 재생성
-- ================================

-- 기존 트리거 제거 (만약 있다면)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- handle_new_user 함수 재생성 (개선된 버전)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name', 
      SPLIT_PART(NEW.email, '@', 1)
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- 이미 존재하는 경우 무시
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 오류가 발생해도 auth 가입 과정을 중단하지 않음
    RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 트리거 재생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================
-- 누락된 사용자 프로필 생성
-- ================================

-- auth.users에는 있지만 public.users에는 없는 사용자들을 찾아서 생성
INSERT INTO public.users (id, email, name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    SPLIT_PART(au.email, '@', 1)
  ) as name,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
  AND au.email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- 결과 로깅을 위한 함수 (개발 환경에서만)
DO $$
DECLARE
  missing_count INTEGER;
  total_auth_users INTEGER;
  total_public_users INTEGER;
BEGIN
  -- auth.users 총 개수
  SELECT COUNT(*) INTO total_auth_users FROM auth.users;
  
  -- public.users 총 개수  
  SELECT COUNT(*) INTO total_public_users FROM public.users;
  
  -- 누락된 사용자 수 계산
  SELECT COUNT(*) INTO missing_count 
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NULL AND au.email IS NOT NULL;
  
  RAISE NOTICE 'Migration completed:';
  RAISE NOTICE 'Total auth.users: %', total_auth_users;
  RAISE NOTICE 'Total public.users: %', total_public_users;
  RAISE NOTICE 'Missing users found and created: %', missing_count;
END $$;