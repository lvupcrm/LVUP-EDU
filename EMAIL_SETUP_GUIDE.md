# 📧 이메일 설정 가이드

## 🚨 현재 문제
이메일 환경 변수가 더미 값으로 설정되어있어 이메일이 발송되지 않음

## ✅ 해결 방법

### Option 1: Supabase 기본 SMTP (권장 - 개발용)

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Authentication 설정 확인**
   ```
   Settings → Authentication → Email Templates
   - Confirm signup: 활성화
   - Magic Link: 활성화  
   - Change Email Address: 활성화
   - Reset Password: 활성화
   ```

3. **개발 환경 이메일 확인**
   - 개발 모드에서는 콘솔에 이메일 링크가 출력됨
   - 브라우저 개발자 도구 Console 탭 확인

### Option 2: Gmail SMTP 설정 (프로덕션용)

1. **Gmail 앱 비밀번호 생성**
   - Google 계정 → 보안 → 2단계 인증 활성화
   - 앱 비밀번호 생성

2. **환경 변수 업데이트** (`.env.local`)
   ```env
   EMAIL_FROM="noreply@yourdomain.com"
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT="587"
   EMAIL_USER="your-real-email@gmail.com"
   EMAIL_PASS="your-app-password-here"
   ```

3. **Vercel 환경 변수 설정**
   - Vercel Dashboard → Settings → Environment Variables
   - 위 환경 변수들 추가

### Option 3: Supabase 커스텀 SMTP

1. **Supabase Dashboard**
   ```
   Settings → Authentication → SMTP Settings
   - Enable custom SMTP
   - Host: smtp.gmail.com
   - Port: 587
   - Username: your-email@gmail.com
   - Password: your-app-password
   ```

## 🔍 디버깅 방법

### 1. 로컬 개발 환경
```bash
# 개발자 도구 Console 확인
# Supabase는 개발 모드에서 이메일 링크를 콘솔에 출력
```

### 2. 프로덕션 환경
```bash
# Supabase Dashboard → Logs
# 이메일 발송 실패 로그 확인
```

## 🚀 즉시 테스트 방법

1. **회원가입 테스트**
   - 새 이메일로 회원가입 시도
   - 브라우저 콘솔 확인 (개발 환경)
   - 이메일함 확인 (프로덕션)

2. **비밀번호 재설정 테스트**
   - 로그인 페이지에서 "비밀번호 찾기"
   - 이메일 주소 입력
   - 결과 확인

## ⚠️ 주의사항

- 개발 환경: Supabase 기본 SMTP 사용 (콘솔 출력)
- 프로덕션: 커스텀 SMTP 설정 필요
- Gmail 사용 시 반드시 앱 비밀번호 사용 (일반 비밀번호 불가)