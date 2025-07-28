-- Enable RLS (Row Level Security)
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================
-- 사용자 관리
-- ================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  nickname TEXT UNIQUE,
  phone TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'INSTRUCTOR', 'ADMIN')),
  user_type TEXT DEFAULT 'TRAINER' CHECK (user_type IN ('TRAINER', 'OPERATOR')),
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  
  -- 프로필 정보
  introduction TEXT,
  experience INTEGER,
  location TEXT,
  specialties JSONB,
  certifications JSONB,
  
  -- 소셜 로그인
  provider_id TEXT,
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMPTZ,
  email_verified_at TIMESTAMPTZ
);

-- User profiles (추가 프로필 정보)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- 추가 프로필 정보
  birth_date DATE,
  gender TEXT,
  occupation TEXT,
  company TEXT,
  website TEXT,
  
  -- 알림 설정
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  marketing_notifications BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ================================
-- 강사 관리
-- ================================

-- Instructor profiles
CREATE TABLE public.instructor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  
  -- 강사 정보
  title TEXT,
  bio TEXT,
  expertise JSONB,
  achievements JSONB,
  educations JSONB,
  
  -- 자격 증명
  certification_docs JSONB,
  resume_doc TEXT,
  portfolio_doc TEXT,
  
  -- 통계
  total_students INTEGER DEFAULT 0,
  total_courses INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_revenue INTEGER DEFAULT 0,
  
  -- 승인 관련
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.users(id),
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ================================
-- 카테고리 및 강의
-- ================================

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('TRAINER', 'OPERATOR')),
  icon TEXT,
  color TEXT,
  order_num INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- 계층 구조
  parent_id UUID REFERENCES public.categories(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Courses
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  
  -- 강의 메타데이터
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  level TEXT DEFAULT 'BEGINNER' CHECK (level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
  type TEXT DEFAULT 'VIDEO' CHECK (type IN ('VIDEO', 'LIVE', 'WORKSHOP')),
  duration INTEGER, -- 총 시간 (분)
  language TEXT DEFAULT 'ko',
  
  -- 가격 정보
  price INTEGER DEFAULT 0, -- 원 단위
  original_price INTEGER,
  discount_rate INTEGER,
  is_free BOOLEAN DEFAULT FALSE,
  
  -- 미디어
  thumbnail TEXT,
  preview_video TEXT,
  images JSONB,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  keywords JSONB,
  
  -- 통계
  enrollment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  -- 설정
  is_public BOOLEAN DEFAULT TRUE,
  allow_preview BOOLEAN DEFAULT TRUE,
  certificate_enabled BOOLEAN DEFAULT FALSE,
  
  -- 관계
  instructor_id UUID REFERENCES public.instructor_profiles(id) NOT NULL,
  category_id UUID REFERENCES public.categories(id) NOT NULL,
  
  -- 타임스탬프
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Lessons
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_num INTEGER NOT NULL,
  duration INTEGER, -- 분 단위
  
  -- 콘텐츠
  video_url TEXT,
  content TEXT,
  resources JSONB,
  
  -- 설정
  is_preview BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(course_id, order_num)
);

-- ================================
-- 수강 및 진도 관리
-- ================================

-- Enrollments
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  
  -- 수강 정보
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED', 'REFUNDED')),
  progress DECIMAL(5,2) DEFAULT 0, -- 진도율 (%)
  
  -- 결제 정보
  payment_id UUID,
  price_paid INTEGER NOT NULL,
  
  -- 타임스탬프
  enrolled_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  
  UNIQUE(user_id, course_id)
);

-- Progress tracking
CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  
  -- 진도 정보
  is_completed BOOLEAN DEFAULT FALSE,
  watch_time INTEGER DEFAULT 0, -- 시청 시간 (초)
  last_position INTEGER DEFAULT 0, -- 마지막 시청 위치 (초)
  
  -- 타임스탬프
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(user_id, lesson_id)
);

-- ================================
-- 리뷰 및 평가
-- ================================

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(user_id, course_id)
);

-- ================================
-- 알림 시스템
-- ================================

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  
  is_read BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ================================
-- 결제 시스템
-- ================================

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  
  -- 결제 정보
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'KRW',
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED')),
  
  -- 외부 결제 시스템 연동
  payment_method TEXT, -- card, bank_transfer, etc.
  external_payment_id TEXT,
  
  -- 타임스탬프
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ================================
-- 인덱스 생성
-- ================================

-- Users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_nickname ON public.users(nickname);
CREATE INDEX idx_users_role ON public.users(role);

-- Courses
CREATE INDEX idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX idx_courses_category_id ON public.courses(category_id);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_courses_level ON public.courses(level);
CREATE INDEX idx_courses_is_free ON public.courses(is_free);

-- Enrollments
CREATE INDEX idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX idx_enrollments_status ON public.enrollments(status);

-- Progress
CREATE INDEX idx_progress_user_id ON public.progress(user_id);
CREATE INDEX idx_progress_lesson_id ON public.progress(lesson_id);

-- Reviews
CREATE INDEX idx_reviews_course_id ON public.reviews(course_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);

-- ================================
-- RLS (Row Level Security) 정책
-- ================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Courses policies (public read)
CREATE POLICY "Anyone can view published courses" ON public.courses
  FOR SELECT USING (status = 'PUBLISHED' AND is_public = true);

-- Instructors can manage their courses
CREATE POLICY "Instructors can manage own courses" ON public.courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.instructor_profiles ip
      WHERE ip.user_id = auth.uid() AND ip.id = courses.instructor_id
    )
  );

-- Enrollments policies
CREATE POLICY "Users can view own enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in courses" ON public.enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================================
-- 트리거 함수들
-- ================================

-- Updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Updated_at 트리거 생성
CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_instructor_profiles_updated_at
  BEFORE UPDATE ON public.instructor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_progress_updated_at
  BEFORE UPDATE ON public.progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();