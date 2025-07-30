# Supabase 이메일 템플릿 설정 가이드

## 이메일 인증 링크 설정

1. Supabase 대시보드에 로그인
2. Authentication > Email Templates 로 이동
3. "Confirm signup" 템플릿 선택
4. 다음과 같이 수정:

### 기존 템플릿 (문제 있음):
```
{{ .SiteURL }}/#access_token={{ .Token }}&token_type=bearer&type=signup
```

### 새로운 템플릿 (수정 필요):
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/auth/welcome
```

## Site URL 설정

1. Authentication > URL Configuration 으로 이동
2. Site URL 확인:
   - 개발: `http://localhost:3000`
   - 프로덕션: `https://your-domain.com`

## Redirect URLs 설정

1. Authentication > URL Configuration > Redirect URLs
2. 다음 URL들을 추가:
   - `http://localhost:3000/auth/confirm`
   - `http://localhost:3000/auth/welcome`
   - `http://localhost:3000/auth/error`
   - `https://your-domain.com/auth/confirm` (프로덕션)
   - `https://your-domain.com/auth/welcome` (프로덕션)
   - `https://your-domain.com/auth/error` (프로덕션)

## 이메일 템플릿 전체 예시

### Confirm signup (회원가입 확인)
```html
<h2>이메일 주소를 확인해주세요</h2>
<p>안녕하세요!</p>
<p>LVUP EDU에 가입해 주셔서 감사합니다. 아래 버튼을 클릭하여 이메일 주소를 확인해주세요:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/auth/welcome">이메일 확인하기</a></p>
<p>이 링크는 24시간 동안 유효합니다.</p>
<p>감사합니다,<br>LVUP EDU 팀</p>
```

### Magic Link (매직 링크 로그인)
```html
<h2>로그인 링크</h2>
<p>안녕하세요!</p>
<p>아래 버튼을 클릭하여 LVUP EDU에 로그인하세요:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next=/dashboard">로그인하기</a></p>
<p>이 링크는 1시간 동안 유효합니다.</p>
<p>감사합니다,<br>LVUP EDU 팀</p>
```

### Reset Password (비밀번호 재설정)
```html
<h2>비밀번호 재설정</h2>
<p>안녕하세요!</p>
<p>비밀번호 재설정을 요청하셨습니다. 아래 버튼을 클릭하여 새 비밀번호를 설정하세요:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/reset-password">비밀번호 재설정하기</a></p>
<p>이 링크는 1시간 동안 유효합니다.</p>
<p>비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하셔도 됩니다.</p>
<p>감사합니다,<br>LVUP EDU 팀</p>
```

## 중요 참고사항

1. **TokenHash vs Token**: 새로운 Supabase 버전에서는 `{{ .Token }}`보다 `{{ .TokenHash }}`를 사용하는 것이 권장됩니다.

2. **Hash Fragment (#) 제거**: URL에 `#` (hash fragment)를 사용하지 마세요. Next.js App Router에서는 서버 사이드에서 hash를 읽을 수 없습니다.

3. **Route Handler 사용**: `/auth/confirm/route.ts`로 서버 사이드에서 토큰을 검증합니다.

4. **에러 처리**: 만료된 링크나 잘못된 토큰에 대한 친화적인 에러 페이지를 제공합니다.