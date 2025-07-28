# LVUP EDU - 피트니스 종합 교육 플랫폼

## 🎯 프로젝트 개요
피트니스 종사자(트레이너 + 운영자)를 위한 전문 교육 플랫폼
- **레퍼런스**: 인프런 플랫폼 구조 및 UX 패턴
- **차별화**: 피트니스 업계 특화 기능 (실무 중심, 자격증 연계, 현장 멘토링)

## 📚 교육 트랙
### 🏋️ 트레이너 교육
- 기초 과정: 해부학, 운동생리학, 안전 관리
- 실무 과정: 프로그램 설계, 동작 분석, 식단 지도  
- 전문 과정: 재활, 퍼포먼스, 특수 집단
- 자격증 대비: CPT, CES, PES 등

### 🏢 운영자 교육
- 기초 운영: 센터 개설, 법무, 보험
- 매출 관리: 회원 관리, 마케팅, 영업
- 조직 관리: 직원 채용, 교육, 평가
- 고급 전략: 브랜드화, 다점포, 프랜차이즈

## 🛠 기술 스택
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: NestJS + TypeScript  
- **Database**: PostgreSQL + Prisma ORM
- **Video**: AWS S3 + CloudFront + HLS 스트리밍
- **Search**: Elasticsearch (강의 검색)
- **Payment**: 토스페이먼츠
- **Auth**: NextAuth.js + JWT

## 📁 프로젝트 구조
```
LVUP-EDU/
├── apps/
│   ├── web/                 # Next.js 프론트엔드
│   ├── api/                 # NestJS 백엔드
│   └── admin/               # 관리자 대시보드
├── packages/
│   ├── ui/                  # 공통 UI 컴포넌트
│   ├── types/               # 타입 정의
│   └── utils/               # 유틸리티 함수
├── prisma/                  # 데이터베이스 스키마
└── docs/                    # 프로젝트 문서
```

## 🚀 개발 단계
### MVP 1단계 (3개월) - 현재 진행률: 70%
- [x] 프로젝트 구조 설계 (Turborepo 모노리포)
- [x] 기본 인증 시스템 (JWT 기반 로그인/회원가입)
- [x] 강의 목록/상세 페이지 구현
- [x] 강사 프로필 관리 시스템
- [x] 데이터베이스 설계 및 시드 데이터
- [x] Swagger API 문서화
- [ ] 강의 업로드/재생 기능
- [ ] 결제 시스템 연동
- [x] 모바일 반응형 UI (Tailwind CSS)

### 확장 2단계 (6개월)  
- [ ] 학습 진도 관리
- [ ] Q&A 시스템
- [ ] 수강평 & 평점
- [ ] 강의 검색 & 필터링
- [ ] 커뮤니티 기능

### 고도화 3단계 (12개월)
- [ ] AI 개인화 추천
- [ ] 모바일 네이티브 앱
- [ ] 동작 분석 시스템  
- [ ] B2B 기업 교육
- [ ] 글로벌 다국어 지원

## 📊 목표 지표
- **MAU**: 5,000명 (6개월)
- **수강 완료율**: 75%+
- **NPS 점수**: 70+
- **자격증 합격률**: 85%+

## 🔗 빠른 시작
```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
# 루트에 .env 파일 생성
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-jwt-secret"

# apps/web/.env.local 파일 생성  
NEXT_PUBLIC_API_URL=http://localhost:8000

# 3. 데이터베이스 설정
npx prisma migrate dev
npx prisma db seed

# 4. 개발 서버 실행
# 백엔드 (포트 8000)
cd apps/api && npm run dev

# 프론트엔드 (포트 3000)  
cd apps/web && npm run dev
```

## 📊 현재 구현된 기능
- ✅ **사용자 인증**: 회원가입, 로그인, JWT 토큰 관리
- ✅ **강의 시스템**: 목록 조회, 상세 페이지, 카테고리 필터링
- ✅ **강사 관리**: 프로필 페이지, 통계, 전문분야 표시
- ✅ **반응형 UI**: 모바일/태블릿/데스크톱 최적화
- ✅ **API 문서**: http://localhost:8000/api/docs

## 📱 주요 페이지
- `/` - 메인 페이지
- `/courses` - 강의 목록 (검색, 필터링)
- `/courses/[id]` - 강의 상세 페이지
- `/instructor/[id]` - 강사 프로필
- `/auth/login` - 로그인
- `/auth/signup` - 회원가입