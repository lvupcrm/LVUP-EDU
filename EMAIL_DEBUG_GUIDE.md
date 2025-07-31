# 📧 이메일 시스템 디버깅 가이드

## 🎯 문제: 회원가입 인증 이메일이 오지 않음

## 🔍 1단계: 개발 환경 확인 (가장 가능성 높음)

### Supabase 개발 모드에서는 실제 이메일을 보내지 않습니다!

**대신 브라우저 콘솔에 인증 링크가 출력됩니다:**

1. **브라우저에서 F12 키 누르기**
2. **Console 탭 선택**
3. **회원가입 진행**
4. **콘솔에서 다음과 같은 메시지 찾기:**
   ```
   Confirm your signup: https://[project-id].supabase.co/auth/v1/verify?token=...
   ```

## 🔍 2단계: Supabase 이메일 설정 확인

### Supabase Dashboard 확인:
1. **https://supabase.com/dashboard 접속**
2. **프로젝트 선택**
3. **Authentication → Email Templates** 확인
4. **Settings → Authentication → Email** 설정 확인

### 확인할 항목:
- ✅ **Confirm signup**: 활성화 여부
- ✅ **Reset Password**: 활성화 여부  
- ✅ **Change Email**: 활성화 여부
- ✅ **SMTP Settings**: 기본값 또는 커스텀 설정

## 🔍 3단계: 로그 확인

### Supabase 로그:
1. **Dashboard → Logs**
2. **Auth 로그 확인**
3. **이메일 발송 실패 로그 찾기**

### 브라우저 네트워크 탭:
1. **F12 → Network 탭**
2. **회원가입 진행**
3. **API 호출 상태 확인**
   - `/auth/v1/signup` 요청 확인
   - 응답 코드 200인지 확인

## 🛠️ 4단계: 해결 방법

### Option 1: 개발 환경 (권장)
**브라우저 콘솔의 인증 링크 직접 사용:**
```javascript
// 콘솔에서 출력되는 링크 예시:
// Confirm your signup: https://[project-id].supabase.co/auth/v1/verify?token=...

// 이 링크를 직접 브라우저 주소창에 붙여넣기
```

### Option 2: Supabase 이메일 템플릿 수정
**Dashboard → Authentication → Email Templates에서:**
```html
<!-- Confirm signup 템플릿 수정 -->
<h2>LVUP EDU 회원가입 확인</h2>
<p>안녕하세요! 회원가입을 완료하려면 아래 링크를 클릭해주세요:</p>
<p><a href="{{ .ConfirmationURL }}">이메일 인증하기</a></p>
```

### Option 3: 커스텀 SMTP 설정 (프로덕션용)
**Gmail SMTP 사용:**
1. **Gmail 앱 비밀번호 생성**
2. **Supabase Dashboard → Settings → Authentication → SMTP**:
   ```
   Host: smtp.gmail.com
   Port: 587
   User: your-email@gmail.com
   Password: your-app-password
   ```

## 🧪 5단계: 테스트 방법

### 회원가입 테스트:
```javascript
// 1. 회원가입 페이지 접속
// 2. F12 → Console 탭 열기
// 3. 테스트 이메일로 가입 시도
// 4. 콘솔에서 인증 링크 확인
// 5. 링크 클릭하여 인증 완료
```

### API 직접 테스트:
```javascript
// 브라우저 콘솔에서 직접 테스트
const { data, error } = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    name: '테스트 사용자'
  })
}).then(res => res.json());

console.log('Signup result:', data, error);
```

## ⚡ 6단계: 즉시 해결 방법

**지금 당장 테스트하려면:**

1. **회원가입 페이지로 이동** (`/auth/signup`)
2. **F12 키 눌러서 개발자 도구 열기**
3. **Console 탭 선택**
4. **새로운 이메일 주소로 회원가입 시도**
5. **콘솔에서 "Confirm your signup:" 메시지 찾기**
6. **해당 링크를 복사해서 새 탭에서 열기**

## 🚨 자주 발생하는 문제

### 문제 1: 콘솔에도 링크가 없음
**원인**: Supabase 설정 오류
**해결**: Authentication → Email Templates에서 "Confirm signup" 활성화

### 문제 2: 링크 클릭 시 404 오류  
**원인**: 콜백 URL 설정 오류
**해결**: Site URL과 Redirect URLs 확인

### 문제 3: 인증 후에도 로그인 안됨
**원인**: 프로필 생성 실패
**해결**: Database Trigger 설정 필요 (위 가이드 참조)

## 📞 지원

**문제가 계속되면:**
1. 브라우저 콘솔 스크린샷
2. Supabase 로그 스크린샷  
3. 회원가입 시 입력한 정보
4. 발생하는 정확한 에러 메시지

이 정보와 함께 문의해주시면 더 정확한 해결책을 제공할 수 있습니다!