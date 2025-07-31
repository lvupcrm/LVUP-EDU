# 🧪 사용자 인증 플로우 완전 테스트 가이드

## 🎯 목표: 회원가입부터 로그인까지 전 과정 검증

## 📋 테스트 체크리스트

### ✅ 사전 준비
- [ ] Database Trigger 설정 완료 (`DATABASE_SETUP_GUIDE.md` 실행)
- [ ] RLS 보안 정책 활성화 완료
- [ ] 웹사이트 정상 접속 확인

### 🔥 핵심 테스트 플로우

## 1단계: 회원가입 테스트

### A. 브라우저 설정
```bash
1. 브라우저에서 F12 키 누르기
2. Console 탭 선택하고 열어두기 (중요!)
3. Network 탭도 함께 열어두기
```

### B. 회원가입 진행
```bash
1. /auth/signup 페이지 접속
2. 테스트 정보 입력:
   - 이메일: test-$(현재시간)@example.com
   - 비밀번호: TestPassword123!
   - 이름: 테스트 사용자
   - 사용자 타입: 트레이너 또는 센터 운영자 선택
3. 이용약관 동의 체크
4. 회원가입 버튼 클릭
```

### C. 결과 확인
**브라우저 콘솔에서 확인할 것:**
```javascript
// 예상 메시지들:
"Starting signup process"
"Calling signUp with user data" 
"Signup result: { user: {...}, session: null }"
"Checking if user profile exists..."
"Creating user profile..." 또는 "Profile already exists"

// 가장 중요한 메시지:
"Confirm your signup: https://[project-id].supabase.co/auth/v1/verify?token=..."
```

**Network 탭에서 확인할 것:**
- `POST /auth/v1/signup` → 200 응답
- `POST /rest/v1/users` → 201 또는 409 응답 (프로필 생성)

## 2단계: 이메일 인증 테스트

### A. 인증 링크 획득
```bash
1. 콘솔에서 "Confirm your signup:" 메시지 찾기
2. 링크 전체를 복사 (https://...verify?token=... 전체)
3. 새 탭에서 해당 링크 열기
```

### B. 인증 완료 확인
**예상 동작:**
- 인증 성공 시: `/auth/welcome` 페이지로 리디렉션
- 환영 메시지와 함께 사용자 이름 표시
- "강의 둘러보기" 버튼 표시

**실패 시:**
- `/auth/error` 페이지로 리디렉션
- 구체적인 오류 메시지 확인

## 3단계: 프로필 생성 검증

### A. 데이터베이스 확인 (Supabase Dashboard)
```sql
-- 1. auth.users 테이블 확인
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'your-test-email@example.com';

-- 2. public.users 테이블 확인  
SELECT id, email, name, role, user_type, created_at
FROM public.users
WHERE email = 'your-test-email@example.com';
```

### B. 예상 결과
**auth.users 테이블:**
- ✅ 레코드 존재
- ✅ `email_confirmed_at` 값이 있음 (인증 완료 시)

**public.users 테이블:**
- ✅ 레코드 존재 (Database Trigger로 자동 생성)
- ✅ `role`: 'STUDENT'
- ✅ `user_type`: 'TRAINER' 또는 'OPERATOR'
- ✅ `name`: 입력한 이름

## 4단계: 로그인 테스트

### A. 로그인 시도
```bash
1. /auth/login 페이지 접속
2. 회원가입한 이메일과 비밀번호로 로그인
3. 브라우저 콘솔에서 로그 확인
```

### B. 예상 결과
**성공 시:**
- 홈페이지(`/`) 또는 대시보드로 리디렉션
- 헤더에 사용자 정보 표시
- "내 강의", "프로필" 등 인증된 사용자 메뉴 표시

**실패 시:**
- 콘솔에서 오류 메시지 확인
- 네트워크 탭에서 API 응답 확인

## 5단계: 인증 상태 검증

### A. 로그인 상태 확인
```javascript
// 브라우저 콘솔에서 실행
const checkAuth = async () => {
  const response = await fetch('/api/auth/user');
  const data = await response.json();
  console.log('Current user:', data);
};
checkAuth();
```

### B. 보호된 페이지 접속
```bash
1. /my/profile 페이지 접속 시도
2. /my/courses 페이지 접속 시도
3. /my/orders 페이지 접속 시도
```

**예상 결과:**
- ✅ 정상 접속 (로그인된 경우)
- ❌ 로그인 페이지로 리디렉션 (미로그인 시)

## 🚨 문제 해결 가이드

### 문제 1: 콘솔에 인증 링크가 없음
**진단:**
```sql
-- Supabase Dashboard → SQL Editor에서 실행
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```
**해결:** `DATABASE_SETUP_GUIDE.md` 다시 실행

### 문제 2: 인증 링크 클릭 시 404
**원인:** Callback URL 설정 오류
**해결:** Supabase → Authentication → URL Configuration 확인

### 문제 3: 프로필이 생성되지 않음
**진단:**
```sql
-- 프로필 존재 여부 확인
SELECT COUNT(*) FROM public.users WHERE email = 'test-email@example.com';
```
**해결:** Database Trigger 재설정 필요

### 문제 4: 로그인 후 403 오류
**원인:** RLS 정책 설정 오류  
**해결:** `SECURITY_FIX_URGENT.sql` 실행

## 📊 성공 기준

### ✅ 모든 테스트 통과 시:
- 회원가입 → 프로필 자동 생성 ✅
- 이메일 인증 → 계정 활성화 ✅  
- 로그인 → 보호된 페이지 접근 ✅
- 사용자 정보 → 정확한 프로필 표시 ✅

### 📈 성능 기준:
- 회원가입 처리: < 3초
- 이메일 인증: 즉시
- 로그인 처리: < 2초
- 페이지 로딩: < 3초

## 🎉 테스트 완료 후

**모든 테스트가 성공하면:**
1. ✅ 사용자 인증 시스템 완전 구축
2. ✅ 이메일 인증 플로우 정상 작동
3. ✅ 자동 프로필 생성 시스템 작동
4. ✅ 보안 정책 정상 적용

**이제 프로덕션 배포 준비 완료!** 🚀

## 📞 추가 지원

**테스트 실패 시 필요한 정보:**
1. 어느 단계에서 실패했는지
2. 브라우저 콘솔 메시지 (스크린샷)
3. Network 탭의 API 응답 (스크린샷)
4. Supabase 로그 (Dashboard → Logs)

이 정보와 함께 문의하시면 정확한 해결책을 제공할 수 있습니다!