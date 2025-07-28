# LVUP EDU 배포 가이드

## Vercel 배포 (프론트엔드)

### 1. Vercel 웹 대시보드 배포

1. https://vercel.com 접속 후 GitHub로 로그인
2. "New Project" → "Import Git Repository" → `LVUP-EDU` 선택
3. 프로젝트 설정:
   - **Root Directory**: `apps/web`
   - **Framework Preset**: Next.js (자동 감지)
   - **Node.js Version**: 18.x

4. 환경 변수 추가:
```env
NEXT_PUBLIC_SUPABASE_URL=https://lhbbnkhytojlvefzcdca.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

5. "Deploy" 클릭

### 2. 자동 배포 설정

GitHub에 푸시하면 자동으로 재배포됩니다:
- Production: `main` 브랜치
- Preview: 다른 모든 브랜치

### 3. 커스텀 도메인 설정

1. Vercel Dashboard → Settings → Domains
2. 커스텀 도메인 추가 (예: lvup-edu.com)
3. DNS 설정 안내 따르기

## Supabase 설정

### 1. 데이터베이스 마이그레이션

SQL Editor에서 순서대로 실행:
1. `supabase/migrations/20240728000001_initial_schema.sql`
2. `supabase/migrations/20240728000002_auth_triggers.sql`
3. `supabase/seed.sql`

### 2. Authentication 설정

1. Authentication → Providers
2. Email 인증 활성화
3. Site URL 설정: Vercel 배포 URL

### 3. 보안 설정

1. Settings → API
2. RLS (Row Level Security) 확인
3. CORS 설정 확인

## 배포 후 테스트

### 1. 기본 기능 테스트
- [ ] 홈페이지 접속
- [ ] 강의 목록 조회
- [ ] 강의 상세 페이지
- [ ] 회원가입/로그인
- [ ] 강사 프로필 페이지

### 2. 성능 테스트
- [ ] Lighthouse 점수 확인
- [ ] Core Web Vitals 측정

### 3. 모니터링 설정
- Vercel Analytics 활성화
- Supabase 모니터링 대시보드 확인

## 문제 해결

### Vercel 빌드 실패
- Node.js 버전 확인 (18.x 권장)
- 환경 변수 설정 확인
- Build logs 확인

### Supabase 연결 실패
- API URL과 Key 확인
- RLS 정책 확인
- CORS 설정 확인

### 성능 이슈
- Image 최적화 (next/image 사용)
- 서버 컴포넌트 활용
- 캐싱 전략 검토