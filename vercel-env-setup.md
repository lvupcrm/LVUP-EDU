# Vercel 환경 변수 설정 가이드

## 🔧 설정해야 할 환경 변수

### 1. NEXT_PUBLIC_SUPABASE_URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://lhbbnkhytojlvefzcdca.supabase.co
Environment: Production, Preview, Development (모두 선택)
```

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoYmJua2h5dG9qbHZlZnpjZGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MDI0MTYsImV4cCI6MjA2OTI3ODQxNn0.LcaEDR3zST0W1Q4K37q_-uPS58asNWmrxeJ4v5Sncgs
Environment: Production, Preview, Development (모두 선택)
```

### 3. NEXT_PUBLIC_API_URL (선택사항)
```
Name: NEXT_PUBLIC_API_URL
Value: http://localhost:8000
Environment: Development만 선택
```

## 📋 설정 단계

1. **Vercel Dashboard** 접속: https://vercel.com/dashboard
2. **LVUP-EDU 프로젝트** 선택
3. **Settings** 탭 클릭
4. **Environment Variables** 메뉴 선택
5. **Add New** 버튼으로 각 변수 추가
6. 모든 변수 추가 후 **Redeploy** 실행

## ✅ 확인 방법

배포 완료 후 다음 URL로 접속하여 환경 변수 상태 확인:
- `https://your-app.vercel.app/debug-env`

## 🚨 주의사항

- 모든 변수는 `NEXT_PUBLIC_` 접두사가 필요합니다
- Environment에서 Production, Preview, Development 모두 선택해야 합니다
- 설정 후 반드시 Redeploy를 실행해야 적용됩니다

## 🔍 테스트 결과

✅ **로컬 Supabase 연결**: 정상 작동
✅ **환경 변수 파일**: 올바르게 설정됨
✅ **Supabase 쿼리**: 성공적으로 실행

**문제**: Vercel에서 환경 변수가 제대로 로드되지 않음
**해결**: 위의 단계에 따라 Vercel Dashboard에서 수동 설정 필요