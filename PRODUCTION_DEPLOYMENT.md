# LVUP EDU 프로덕션 배포 가이드

이 문서는 LVUP EDU 플랫폼을 실제 서비스로 런칭하기 위한 종합적인 배포 가이드입니다.

## 📋 배포 전 체크리스트

### 1. 인프라 준비
- [ ] 도메인 구매 및 DNS 설정
- [ ] SSL 인증서 설정 (Let's Encrypt 또는 Cloudflare)
- [ ] CDN 설정 (Cloudflare 권장)
- [ ] 백업 시스템 구축
- [ ] 모니터링 시스템 설정

### 2. 데이터베이스 설정
- [ ] Supabase 프로덕션 인스턴스 생성
- [ ] 데이터베이스 마이그레이션 실행
- [ ] RLS (Row Level Security) 정책 검토
- [ ] 백업 스케줄 설정
- [ ] 연결 풀링 설정

### 3. 환경 변수 설정
- [ ] 모든 프로덕션 환경 변수 설정
- [ ] 시크릿 키 로테이션 계획 수립
- [ ] API 키 보안 검토

### 4. 성능 최적화
- [ ] 이미지 최적화 및 압축
- [ ] 번들 크기 최적화
- [ ] 캐싱 전략 구현
- [ ] 지연 로딩 구현

### 5. 보안 강화
- [ ] 보안 헤더 검증
- [ ] Rate limiting 구현
- [ ] Input validation 강화
- [ ] HTTPS 강제 적용

## 🚀 배포 옵션

### Option 1: Vercel (권장)

**장점:**
- Next.js에 최적화된 플랫폼
- 자동 스케일링
- 글로벌 CDN
- 간편한 배포

**배포 단계:**

1. **Vercel 프로젝트 생성**
   ```bash
   npm i -g vercel
   vercel login
   vercel --prod
   ```

2. **환경 변수 설정**
   ```bash
   # Vercel 대시보드에서 설정 또는 CLI 사용
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add TOSS_SECRET_KEY
   # ... 기타 환경 변수들
   ```

3. **도메인 연결**
   ```bash
   vercel domains add yourdomain.com
   ```

4. **배포 설정 최적화**
   ```json
   // vercel.json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "framework": "nextjs",
     "functions": {
       "pages/api/**/*.ts": {
         "runtime": "nodejs18.x"
       }
     },
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "X-Frame-Options",
             "value": "DENY"
           },
           {
             "key": "X-Content-Type-Options",
             "value": "nosniff"
           }
         ]
       }
     ]
   }
   ```

### Option 2: Docker + Cloud Run (구글 클라우드)

**장점:**
- 컨테이너 기반 배포
- 자동 스케일링
- 비용 효율적

**배포 단계:**

1. **Docker 이미지 빌드**
   ```bash
   docker build -t lvup-edu-web .
   docker tag lvup-edu-web gcr.io/PROJECT_ID/lvup-edu-web
   ```

2. **Google Container Registry에 푸시**
   ```bash
   docker push gcr.io/PROJECT_ID/lvup-edu-web
   ```

3. **Cloud Run 배포**
   ```bash
   gcloud run deploy lvup-edu-web \
     --image gcr.io/PROJECT_ID/lvup-edu-web \
     --platform managed \
     --region asia-northeast1 \
     --allow-unauthenticated
   ```

### Option 3: AWS ECS + Fargate

**장점:**
- AWS 생태계 통합
- 높은 커스터마이징 가능성
- 기업급 보안

**배포 단계:**

1. **ECR 리포지토리 생성**
   ```bash
   aws ecr create-repository --repository-name lvup-edu-web
   ```

2. **Docker 이미지 푸시**
   ```bash
   aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com
   docker build -t lvup-edu-web .
   docker tag lvup-edu-web:latest ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com/lvup-edu-web:latest
   docker push ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com/lvup-edu-web:latest
   ```

3. **ECS 서비스 생성**
   - Fargate 클러스터 생성
   - 태스크 정의 작성
   - 서비스 생성 및 로드 밸런서 연결

## 🔧 설정 가이드

### 1. Supabase 프로덕션 설정

```sql
-- RLS 정책 검토 예시
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid() = id);

-- 성능 최적화를 위한 인덱스
CREATE INDEX idx_courses_published ON courses(is_published) WHERE is_published = true;
CREATE INDEX idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX idx_lesson_progress_enrollment ON lesson_progress(enrollment_id);
```

### 2. DNS 및 도메인 설정

```
# DNS 레코드 예시
A    @              1.2.3.4
A    www            1.2.3.4
CNAME api           your-api-domain.com
CNAME cdn           your-cdn-domain.com
```

### 3. Cloudflare 설정 (권장)

```yaml
# Page Rules 설정
- URL: *.yourdomain.com/api/*
  Setting: Cache Level - Bypass

- URL: *.yourdomain.com/static/*
  Setting: Cache Level - Cache Everything
  Edge Cache TTL: 1 year

- URL: *.yourdomain.com/*
  Setting: Always Use HTTPS
```

### 4. 모니터링 설정

```yaml
# Docker Compose 모니터링 스택
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana

volumes:
  grafana-storage:
```

## 📊 성능 최적화

### 1. 이미지 최적화

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizeCss: true,
    optimizeImages: true,
  }
}
```

### 2. 번들 분석 및 최적화

```bash
# Bundle analyzer 설치 및 실행
npm install --save-dev @next/bundle-analyzer
npm run analyze
```

### 3. 캐싱 전략

```typescript
// API 응답 캐싱
export async function GET(request: NextRequest) {
  const response = NextResponse.json(data)
  
  // 정적 데이터는 긴 캐시
  response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600')
  
  // 동적 데이터는 짧은 캐시
  response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60')
  
  return response
}
```

## 🔒 보안 강화

### 1. SSL/TLS 설정

```nginx
# Nginx SSL 설정 예시
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
}
```

### 2. 환경 변수 보안

```bash
# AWS Systems Manager Parameter Store 사용 예시
aws ssm put-parameter \
    --name "/lvup-edu/production/database-url" \
    --value "postgresql://..." \
    --type "SecureString"
```

### 3. Rate Limiting

```typescript
// Upstash Redis를 사용한 Rate Limiting
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
})

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? "127.0.0.1"
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    )
  }
  
  return NextResponse.next()
}
```

## 📈 모니터링 및 로깅

### 1. 에러 추적 (Sentry)

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: false,
})
```

### 2. 로그 관리

```typescript
// lib/logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
})
```

### 3. 상태 모니터링

```typescript
// 헬스체크 엔드포인트는 이미 구현됨
// /api/health에서 서비스 상태 확인 가능
```

## 🚨 장애 대응

### 1. 백업 전략

```bash
# Supabase 백업 스크립트
#!/bin/bash
DATE=$(date +"%Y%m%d_%H%M%S")
pg_dump $DATABASE_URL > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
```

### 2. 롤백 계획

```bash
# Vercel 이전 배포로 롤백
vercel --prod --rollback

# Docker 이전 버전으로 롤백
docker pull gcr.io/PROJECT_ID/lvup-edu-web:previous-tag
kubectl set image deployment/lvup-edu-web app=gcr.io/PROJECT_ID/lvup-edu-web:previous-tag
```

### 3. 재해 복구

- **RTO (Recovery Time Objective)**: 1시간
- **RPO (Recovery Point Objective)**: 15분
- **백업 주기**: 매일 자동 백업
- **백업 보관**: 30일

## 🎯 성능 목표

### Core Web Vitals 목표
- **LCP (Largest Contentful Paint)**: < 2.5초
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### 기타 성능 지표
- **TTFB (Time to First Byte)**: < 600ms
- **Speed Index**: < 3.0초
- **페이지 로드 시간**: < 3초 (3G 네트워크)

## 🔄 지속적인 개선

### 1. A/B 테스트 설정

```typescript
// Feature flag를 통한 A/B 테스트
export function useFeatureFlag(flagName: string) {
  return process.env.NODE_ENV === 'production' 
    ? process.env[`NEXT_PUBLIC_FEATURE_${flagName.toUpperCase()}`] === 'true'
    : true
}
```

### 2. 성능 모니터링

```typescript
// Web Vitals 추적
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric: any) {
  gtag('event', metric.name, {
    value: Math.round(metric.value),
    event_category: 'Web Vitals',
  })
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

## 📞 지원 및 문의

배포 과정에서 문제가 발생하면:

1. **로그 확인**: `/logs` 디렉토리 또는 클라우드 로그 확인
2. **헬스체크**: `/api/health` 엔드포인트로 서비스 상태 확인
3. **모니터링 대시보드**: Grafana 또는 클라우드 모니터링 콘솔 확인
4. **문서 참조**: 각 서비스별 공식 문서 확인

---

**성공적인 배포를 위해 이 가이드의 모든 단계를 차례대로 진행하시기 바랍니다!** 🚀