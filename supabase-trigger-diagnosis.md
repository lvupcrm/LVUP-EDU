# Supabase Auth Trigger 진단 리포트

## 현재 상황 요약

LVUP EDU 프로젝트에서 사용자가 회원가입할 때 `auth.users`에는 계정이 생성되지만 `public.users` 테이블에 프로필이 자동으로 생성되지 않는 문제가 발생하고 있습니다.

## 구현된 시스템 분석

### 1. 트리거 시스템

#### 현재 트리거 설정
- **파일**: `20240728000002_auth_triggers.sql`, `20241201000004_fix_missing_users.sql`
- **트리거명**: `on_auth_user_created`
- **함수**: `public.handle_new_user()`
- **이벤트**: `AFTER INSERT ON auth.users`

#### 트리거 함수 구현
```sql
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
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

### 2. RLS (Row Level Security) 정책

#### 현재 users 테이블 RLS 정책
- `Users can view own profile` - SELECT USING (auth.uid() = id)
- `Users can update own profile` - UPDATE USING (auth.uid() = id)
- `Enable insert for authenticated users only` - INSERT WITH CHECK (auth.role() = 'authenticated')

### 3. 진단 도구 구현

다음 진단 페이지들이 구현되었습니다:

1. **`/debug/user-profiles`** - auth.users와 public.users 동기화 상태 확인
2. **`/debug/trigger-status`** - 트리거 상태와 RLS 정책 종합 진단
3. **`/debug/comprehensive-diagnosis`** - 전체 시스템 종합 진단
4. **`/debug/fix-rls`** - RLS 정책 자동 수정 도구

### 4. 디버그 함수들

#### 구현된 RPC 함수들
- `get_auth_users()` - auth.users 데이터 조회
- `check_user_sync_status()` - 동기화 상태 확인
- `create_missing_user_profiles()` - 누락된 프로필 일괄 생성
- `get_trigger_status()` - 트리거 상태 조회
- `get_rls_policies()` - RLS 정책 조회
- `execute_sql()` - SQL 실행 (진단용)

## 잠재적 문제점 분석

### 1. RLS 정책 충돌 (가장 가능성 높음)

**문제**: `users` 테이블의 INSERT 정책이 트리거 실행을 차단할 수 있음

**증상**:
- auth.users에는 사용자 생성됨
- public.users에는 프로필 생성 안됨
- 트리거 함수는 예외 처리로 인해 오류 없이 완료

**해결책**:
1. SECURITY DEFINER 권한으로 RLS 우회
2. 트리거 함수에서 적절한 권한 설정
3. INSERT 정책 조건 완화

### 2. 트리거 함수 권한 문제

**문제**: 함수가 SECURITY DEFINER로 실행되지 않음

**확인 방법**:
```sql
SELECT proname, prosecdef 
FROM pg_proc p 
JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE proname = 'handle_new_user' AND n.nspname = 'public';
```

### 3. 트리거 자체가 비활성화되었거나 삭제됨

**확인 방법**:
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### 4. 데이터 타입 불일치 또는 제약 조건 위반

**확인사항**:
- UUID 타입 호환성
- NOT NULL 제약 조건
- 외래 키 제약 조건

## 진단 및 해결 프로세스

### 1단계: 기본 상태 확인
1. `/debug/comprehensive-diagnosis` 페이지 방문
2. 전체 진단 실행하여 현재 상태 파악

### 2단계: 세부 진단
1. **트리거 상태**: `/debug/trigger-status` 페이지에서 트리거 존재 여부 확인
2. **동기화 상태**: `/debug/user-profiles` 페이지에서 누락된 프로필 확인
3. **RLS 정책**: RLS 정책이 트리거 실행을 차단하는지 확인

### 3단계: 실시간 테스트
1. End-to-End 테스트 실행
2. 새 사용자 생성하여 트리거 작동 여부 확인
3. 오류 로그 확인

### 4단계: 문제 해결
1. **RLS 문제인 경우**: `/debug/fix-rls` 페이지에서 자동 수정
2. **트리거 문제인 경우**: 마이그레이션 재실행
3. **누락된 프로필**: `create_missing_user_profiles()` 함수 실행

## 권장 해결 순서

### 즉시 해결 (개발 환경)
1. RLS 임시 비활성화로 빠른 해결
2. 누락된 프로필 일괄 생성

### 근본적 해결 (프로덕션 준비)
1. 트리거 함수에 적절한 SECURITY DEFINER 권한 확인
2. RLS 정책을 트리거와 호환되도록 수정
3. 트리거 실행 로그 모니터링 설정

## 모니터링 및 예방

### 지속적 모니터링
1. 주기적으로 동기화 상태 확인
2. 트리거 실행 오류 로그 모니터링
3. 새 사용자 가입 시 프로필 생성 확인

### 예방 조치
1. 트리거 함수에 강화된 오류 처리
2. 백업 메커니즘 구현 (배치 작업으로 누락된 프로필 생성)
3. 알림 시스템으로 동기화 실패 감지

## 사용 가능한 진단 도구

### URL 목록
- `/debug/comprehensive-diagnosis` - 종합 진단
- `/debug/trigger-status` - 트리거 상태 진단
- `/debug/user-profiles` - 사용자 프로필 동기화 상태
- `/debug/fix-rls` - RLS 정책 자동 수정
- `/debug/supabase` - 기본 Supabase 연결 테스트

### 사용 방법
1. 개발 서버 실행: `npm run dev`
2. 브라우저에서 해당 URL 접속
3. 진단 도구 실행하여 문제 파악
4. 권장 조치 따라 문제 해결

이 진단 시스템을 통해 auth.users와 public.users 간의 동기화 문제를 체계적으로 파악하고 해결할 수 있습니다.