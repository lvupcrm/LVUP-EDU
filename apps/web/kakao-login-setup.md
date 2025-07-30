# 카카오 로그인 설정 가이드

## 개요
LVUP EDU 프로젝트에 카카오 소셜 로그인을 구현했습니다. 사용자는 이메일/비밀번호 대신 카카오톡 계정으로 간편하게 로그인할 수 있습니다.

## 구현된 기능

### 1. 로그인 페이지 (`/auth/login`)
- 기존 이메일 로그인 폼 아래에 "카카오로 로그인" 버튼 추가
- 노란색 카카오 브랜드 컬러와 아이콘 적용

### 2. 회원가입 페이지 (`/auth/signup`)
- 상단에 "카카오로 시작하기" 버튼 추가
- 이메일 회원가입과 소셜 로그인 선택 가능

### 3. OAuth 콜백 처리 (`/auth/callback`)
- 카카오 인증 후 리다이렉트 처리
- 신규 사용자는 프로필 완성 페이지로 이동
- 기존 사용자는 홈 또는 지정된 페이지로 이동

### 4. 프로필 완성 페이지 (`/auth/complete-profile`)
- 카카오 로그인 후 추가 정보 입력
- 이름, 사용자 타입(트레이너/운영자) 선택
- 선택사항: 닉네임, 전화번호

## Supabase 설정 방법

### 1. 카카오 개발자 콘솔 설정

1. [Kakao Developers](https://developers.kakao.com/) 접속 및 로그인
2. "내 애플리케이션" → "애플리케이션 추가하기"
3. 앱 이름과 회사명 입력 후 저장
4. 앱 키 섹션에서 **REST API 키** 복사 (이것이 client_id가 됩니다)

### 2. 카카오 앱 설정

1. 제품 설정 → 카카오 로그인 활성화
2. Redirect URI 추가:
   ```
   https://lhbbnkhytojlvefzcdca.supabase.co/auth/v1/callback
   ```
3. 동의 항목 설정:
   - 닉네임 (선택)
   - 프로필 사진 (선택)
   - 카카오계정(이메일) (필수)

### 3. Supabase 대시보드 설정

1. Supabase 프로젝트 대시보드 접속
2. Authentication → Providers → Kakao 찾기
3. 다음 정보 입력:
   - **Client ID**: 카카오 REST API 키
   - **Client Secret**: 카카오 앱에서 생성한 시크릿 키
4. "Enable Kakao" 토글 활성화 후 저장

### 4. Redirect URLs 설정

Supabase 대시보드 → Authentication → URL Configuration에서 다음 URL 추가:

**개발 환경:**
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/auth/complete-profile`
- `http://localhost:3000/auth/welcome`
- `http://localhost:3000/auth/error`

**프로덕션 환경:**
- `https://your-domain.com/auth/callback`
- `https://your-domain.com/auth/complete-profile`
- `https://your-domain.com/auth/welcome`
- `https://your-domain.com/auth/error`

## 데이터베이스 구조

### users 테이블 업데이트
카카오 로그인 사용자를 위한 필드:
- `provider_id`: 소셜 로그인 제공자 (예: 'kakao', 'email')
- `avatar`: 카카오 프로필 이미지 URL 저장

## 사용자 플로우

### 신규 사용자 (카카오 회원가입)
1. "카카오로 시작하기" 버튼 클릭
2. 카카오 로그인 페이지로 리다이렉트
3. 카카오 계정으로 로그인 및 동의
4. `/auth/callback`으로 리다이렉트
5. `/auth/complete-profile`로 이동하여 추가 정보 입력
6. 프로필 완성 후 `/auth/welcome`으로 이동

### 기존 사용자 (카카오 로그인)
1. "카카오로 로그인" 버튼 클릭
2. 카카오 로그인 페이지로 리다이렉트
3. 카카오 계정으로 로그인
4. `/auth/callback`으로 리다이렉트
5. 홈페이지(`/`) 또는 이전 페이지로 이동

## 주의사항

1. **개발 환경**: localhost에서 테스트 시 Supabase CLI를 사용하거나 실제 Supabase 프로젝트를 사용해야 합니다.

2. **프로덕션 배포**: 
   - Vercel 환경 변수에 Supabase 키 설정 필요
   - 카카오 앱의 Redirect URI를 프로덕션 도메인으로 업데이트

3. **보안**: 
   - Client Secret은 절대 클라이언트 코드에 노출되면 안 됩니다
   - 서버 사이드에서만 사용하거나 Supabase가 관리하도록 합니다

4. **사용자 경험**:
   - 카카오 로그인 실패 시 친화적인 에러 메시지 표시
   - 프로필 미완성 사용자는 자동으로 완성 페이지로 안내

## 테스트 방법

1. 로컬 개발 서버 실행: `npm run dev`
2. `/auth/login` 또는 `/auth/signup` 페이지 접속
3. "카카오로 로그인" 또는 "카카오로 시작하기" 버튼 클릭
4. 카카오 계정으로 로그인
5. 프로필 완성 (신규 사용자인 경우)
6. 로그인 성공 확인

## 트러블슈팅

### "Invalid redirect URL" 에러
- Supabase 대시보드에서 Redirect URLs 설정 확인
- 정확한 URL 형식 사용 (trailing slash 주의)

### 카카오 로그인 후 에러 페이지로 이동
- 카카오 앱 설정에서 동의 항목 확인
- Supabase Provider 설정의 Client ID/Secret 확인

### 프로필 정보가 저장되지 않음
- `users` 테이블의 RLS 정책 확인
- 인증된 사용자가 자신의 프로필을 업데이트할 수 있는지 확인

---

이 문서는 카카오 로그인 구현에 대한 전체적인 가이드입니다. 추가 질문이나 문제가 있으면 이슈를 생성해주세요.