# LVUP EDU 프로젝트 가이드

이 문서는 LVUP EDU 프로젝트 개발 중 발생했던 문제들과 해결 방법을 정리한 것입니다.
Claude Code와 함께 작업할 때 참고하여 같은 문제가 반복되지 않도록 합니다.

## 프로젝트 개요

- **프로젝트명**: LVUP EDU - 피트니스 전문가 교육 플랫폼
- **기술 스택**: 
  - Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS
  - Backend: Supabase (PostgreSQL, Auth, Storage)
  - Payment: TossPayments
  - Deployment: Vercel
- **모노레포 구조**: Turborepo 사용

## 자주 발생한 문제와 해결 방법

### 1. TypeScript 타입 에러

#### 문제 1: Supabase 쿼리 결과 타입 불일치
```typescript
// 문제: Property 'avatar' does not exist on type
instructor.user?.avatar // 에러 발생
```

**해결 방법**:
```typescript
// 1. 명시적 타입 인터페이스 정의
interface Instructor {
  id: string
  users?: {
    avatar?: string
    // 기타 필드들
  }
}

// 2. Supabase 관계 이름 확인 (user vs users)
// 실제 DB에서는 'users'로 되어있는 경우가 많음
instructor.users?.avatar // 올바른 접근

// 3. any 타입 캐스팅 (임시 해결책)
await tossPayments.requestPayment(selectedMethod as any, paymentData)
```

#### 문제 2: 객체 속성 동적 추가
```typescript
// 문제: Property 'courseCount' does not exist
instructor.courseCount = count // 에러 발생
```

**해결 방법**:
```typescript
// 새로운 객체로 재구성
const instructorsWithCount = instructors.map(instructor => ({
  ...instructor,
  courseCount: count || 0
}))
```

### 2. Vercel 빌드 에러

#### 문제 1: 환경 변수 누락
```
Error: supabaseUrl is required
```

**해결 방법**:
1. Vercel 대시보드 > Settings > Environment Variables
2. 다음 환경 변수 추가:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_TOSS_CLIENT_KEY=your-toss-client-key
   TOSS_SECRET_KEY=your-toss-secret-key
   ```
3. 모든 환경(Production, Preview, Development)에 적용

#### 문제 2: 반복되는 빌드 실패
**해결 방법**:
- 빈 커밋으로 재빌드 트리거:
  ```bash
  git commit --allow-empty -m "Trigger rebuild"
  git push
  ```

### 3. CSS 컴파일 에러

#### 문제: 존재하지 않는 Tailwind 클래스
```css
/* 문제 */
@apply border-border; /* 'border-border' class does not exist */
```

**해결 방법**:
```css
/* 해결 */
@apply border-gray-200; /* Tailwind 기본 클래스 사용 */
```

### 4. 인증 시스템 관련

#### 문제: NextAuth에서 Supabase Auth로 전환
**주의사항**:
- `useSession` → `supabase.auth.getUser()`
- `signIn` → `supabase.auth.signInWithPassword()`
- `signOut` → `supabase.auth.signOut()`
- 모든 인증 관련 컴포넌트 수정 필요

### 5. Supabase 관련

#### 문제 1: Foreign Key 제약 조건
```sql
-- 문제: auth.users에 없는 user_id로 INSERT 시도
INSERT INTO public.users (id, email, name) VALUES ('invalid-uuid', ...);
```

**해결 방법**:
```sql
-- 함수 기반 접근으로 해결
CREATE OR REPLACE FUNCTION create_sample_data()
RETURNS VOID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- auth.users에 먼저 생성
  -- 그 다음 public.users에 생성
END;
$$ LANGUAGE plpgsql;
```

#### 문제 2: RLS (Row Level Security) 정책
**주의사항**:
- 모든 테이블에 적절한 RLS 정책 설정
- 개발 중에는 임시로 비활성화 가능하나, 프로덕션에서는 필수

### 6. 결제 시스템 (TossPayments)

#### 문제: 결제 방법 타입 불일치
```typescript
// 문제: Type 'string' is not assignable to parameter
tossPayments.requestPayment(selectedMethod, paymentData)
```

**해결 방법**:
```typescript
// any 타입으로 캐스팅
await tossPayments.requestPayment(selectedMethod as any, paymentData)

// 또는 정확한 타입 정의
type PaymentMethod = '카드' | '가상계좌' | '간편결제'
```

## 개발 팁과 모범 사례

### 1. 타입 안전성
- 가능한 모든 곳에 TypeScript 타입 정의
- Supabase 쿼리 결과에 대한 인터페이스 정의
- `any` 타입은 최후의 수단으로만 사용

### 2. 환경 변수 관리
- `.env.local` 파일로 로컬 개발
- `.env.example` 파일로 필요한 환경 변수 문서화
- Vercel 배포 시 모든 환경 변수 설정 확인

### 3. 에러 처리
- 사용자 친화적인 에러 메시지 제공
- console.error로 개발자용 로그 남기기
- try-catch 블록으로 예외 처리

### 4. 성능 최적화
- 이미지는 Next.js Image 컴포넌트 사용
- 동적 import로 코드 스플리팅
- 불필요한 리렌더링 방지 (React.memo, useMemo)

## 자주 사용하는 명령어

```bash
# 개발 서버 실행
npm run dev

# 빌드 테스트
npm run build

# 타입 체크
npm run type-check

# Supabase 타입 생성
npx supabase gen types typescript --project-id your-project-id > types/supabase.ts

# Git 커밋 (이모지 포함)
git commit -m "feat: 새로운 기능 추가 ✨"
```

## 트러블슈팅 체크리스트

배포 전 확인사항:
- [ ] 모든 TypeScript 에러 해결
- [ ] 환경 변수 설정 완료
- [ ] 로컬에서 `npm run build` 성공
- [ ] Supabase RLS 정책 검토
- [ ] 결제 테스트 환경 확인
- [ ] 반응형 디자인 테스트

## 유용한 리소스

- [Next.js 14 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [TossPayments 문서](https://docs.tosspayments.com)
- [Vercel 문서](https://vercel.com/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)

---

이 문서는 프로젝트가 진행되면서 계속 업데이트됩니다.
새로운 문제와 해결 방법을 발견하면 이 문서에 추가해주세요.