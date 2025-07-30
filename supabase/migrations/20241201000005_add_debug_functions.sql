-- ================================
-- 디버그용 RPC 함수들
-- ================================

-- auth.users 데이터를 조회하는 함수 (관리자용)
CREATE OR REPLACE FUNCTION get_auth_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  user_metadata JSONB
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = auth, public
AS $$
  SELECT 
    au.id,
    au.email,
    au.created_at,
    au.raw_user_meta_data as user_metadata
  FROM auth.users au
  ORDER BY au.created_at DESC;
$$;

-- 누락된 사용자 프로필을 일괄 생성하는 함수
CREATE OR REPLACE FUNCTION create_missing_user_profiles()
RETURNS TABLE (
  created_count INTEGER,
  created_users TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  created_count INTEGER := 0;
  created_users TEXT[] := '{}';
BEGIN
  -- auth.users에는 있지만 public.users에는 없는 사용자들을 찾아서 생성
  FOR user_record IN 
    SELECT 
      au.id,
      au.email,
      au.created_at,
      au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.users pu ON au.id = pu.id
    WHERE pu.id IS NULL AND au.email IS NOT NULL
  LOOP
    BEGIN
      INSERT INTO public.users (id, email, name, role, created_at, updated_at)
      VALUES (
        user_record.id,
        user_record.email,
        COALESCE(
          user_record.raw_user_meta_data->>'full_name',
          user_record.raw_user_meta_data->>'name',
          SPLIT_PART(user_record.email, '@', 1)
        ),
        'STUDENT',
        user_record.created_at,
        NOW()
      );
      
      created_count := created_count + 1;
      created_users := array_append(created_users, user_record.email);
      
    EXCEPTION
      WHEN OTHERS THEN
        -- 개별 사용자 생성 실패 시 로그만 남기고 계속 진행
        RAISE NOTICE 'Failed to create profile for user %: %', user_record.email, SQLERRM;
    END;
  END LOOP;
  
  RETURN QUERY SELECT created_count, created_users;
END;
$$;

-- 사용자 동기화 상태 확인 함수
CREATE OR REPLACE FUNCTION check_user_sync_status()
RETURNS TABLE (
  total_auth_users INTEGER,
  total_public_users INTEGER,
  missing_profiles INTEGER,
  sync_percentage NUMERIC
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = auth, public
AS $$
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
    auth_count::INTEGER as total_auth_users,
    public_count::INTEGER as total_public_users,
    missing_count::INTEGER as missing_profiles,
    CASE 
      WHEN auth_count > 0 THEN 
        ROUND(((auth_count - missing_count) * 100.0 / auth_count), 2)
      ELSE 100.0 
    END as sync_percentage
  FROM user_counts;
$$;