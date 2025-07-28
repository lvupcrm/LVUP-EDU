# Supabase 설정 가이드

## 1. Supabase 클라우드 프로젝트 생성

1. https://supabase.com 접속
2. GitHub 계정으로 로그인
3. "New project" 클릭
4. 프로젝트 정보 입력:
   - Project name: `lvup-edu`
   - Database Password: 강력한 비밀번호 (저장 필수!)
   - Region: `Northeast Asia (Seoul)`
   - Pricing Plan: `Free tier`

## 2. API 키 및 URL 확인

1. 프로젝트 생성 후 Settings > API 메뉴 접속
2. 다음 정보 복사:
   - Project URL: `https://your-project-id.supabase.co`
   - anon public key: `your_anon_key_here`

## 3. 환경 변수 설정

`apps/web/.env.local` 파일의 다음 값들을 실제 값으로 교체:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. 데이터베이스 마이그레이션

Supabase Dashboard > SQL Editor에서 다음 순서로 실행:

### 4.1 기본 스키마 생성
```sql
-- supabase/migrations/20240728000001_initial_schema.sql 파일 내용 복사하여 실행
```

### 4.2 인증 트리거 설정
```sql
-- supabase/migrations/20240728000002_auth_triggers.sql 파일 내용 복사하여 실행
```

### 4.3 시드 데이터 삽입
```sql
-- supabase/seed.sql 파일 내용 복사하여 실행
```

## 5. 샘플 강사 데이터 생성

회원가입 후 다음 함수 실행으로 샘플 강사 데이터 생성:

```sql
-- 실제 사용자 UUID를 넣어 실행
SELECT create_sample_instructor_data('실제_사용자_UUID');
```

## 6. RLS (Row Level Security) 확인

Authentication > Policies에서 다음 정책들이 생성되었는지 확인:
- users 테이블: 인증된 사용자만 삽입 가능
- instructor_profiles: 강사는 자신의 프로필만 수정
- courses: 강사는 자신의 강의만 관리
- lessons: 강의 소유자만 레슨 관리
- 기타 사용자별 데이터 접근 제한

## 7. 테스트

1. 프론트엔드에서 회원가입/로그인 테스트
2. 강의 목록 조회 테스트
3. 강사 프로필 페이지 접근 테스트

## 주의사항

- 데이터베이스 비밀번호를 안전하게 보관하세요
- Free tier는 프로젝트 2개, 500MB 저장공간 제한이 있습니다
- 실제 배포 시에는 환경 변수를 Vercel에도 설정해야 합니다