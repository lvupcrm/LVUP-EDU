-- LVUP EDU Supabase RLS 정책 수정
-- 이 스크립트를 Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. 기존 RLS 정책 제거 (있다면)
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- 2. 새로운 RLS 정책 생성
-- 회원가입 시 자신의 프로필 생성 허용
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 자신의 프로필 조회 허용
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- 자신의 프로필 수정 허용
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. RLS 활성화 확인
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. 테스트용: 임시로 모든 사용자의 INSERT 허용 (선택사항)
-- 개발 중에만 사용하고, 프로덕션에서는 제거하세요
-- CREATE POLICY "Allow signup" ON users FOR INSERT WITH CHECK (true);