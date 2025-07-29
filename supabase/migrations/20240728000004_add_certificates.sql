-- 수료증 테이블
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE NOT NULL,
  certificate_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  pdf_url TEXT,
  metadata JSONB DEFAULT '{}' NOT NULL,
  UNIQUE(user_id, course_id)
);

-- 인덱스
CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX idx_certificates_course_id ON public.certificates(course_id);
CREATE INDEX idx_certificates_certificate_number ON public.certificates(certificate_number);

-- RLS 정책
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 수료증만 조회 가능
CREATE POLICY "Users can view own certificates" ON public.certificates
  FOR SELECT
  USING (auth.uid() = user_id);

-- 강사는 자신의 코스의 수료증 조회 가능
CREATE POLICY "Instructors can view course certificates" ON public.certificates
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = course_id
    AND c.instructor_id = auth.uid()
  ));

-- 시스템만 수료증 생성 가능 (서비스 역할)
CREATE POLICY "System can create certificates" ON public.certificates
  FOR INSERT
  WITH CHECK (false);

-- 수료증 번호 생성 함수
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
  year_month TEXT;
  sequence_num INTEGER;
  cert_number TEXT;
BEGIN
  -- YYYYMM 형식
  year_month := TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMM');
  
  -- 해당 월의 시퀀스 번호 가져오기
  SELECT COUNT(*) + 1 INTO sequence_num
  FROM public.certificates
  WHERE certificate_number LIKE year_month || '%';
  
  -- 수료증 번호 생성 (예: 202407-0001)
  cert_number := year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN cert_number;
END;
$$ LANGUAGE plpgsql;

-- 수료증 발급 조건 확인 함수
CREATE OR REPLACE FUNCTION check_certificate_eligibility(
  p_enrollment_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_progress NUMERIC;
  v_status TEXT;
BEGIN
  SELECT progress, status INTO v_progress, v_status
  FROM public.enrollments
  WHERE id = p_enrollment_id;
  
  -- 100% 완료 또는 COMPLETED 상태인 경우
  RETURN (v_progress >= 100 OR v_status = 'COMPLETED');
END;
$$ LANGUAGE plpgsql;

-- 수료증 자동 발급 트리거 (옵션)
CREATE OR REPLACE FUNCTION auto_issue_certificate()
RETURNS TRIGGER AS $$
BEGIN
  -- 수강 완료 시 자동 수료증 발급
  IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
    -- 이미 수료증이 있는지 확인
    IF NOT EXISTS (
      SELECT 1 FROM public.certificates
      WHERE enrollment_id = NEW.id
    ) THEN
      INSERT INTO public.certificates (
        user_id,
        course_id,
        enrollment_id,
        certificate_number,
        metadata
      ) VALUES (
        NEW.user_id,
        NEW.course_id,
        NEW.id,
        generate_certificate_number(),
        jsonb_build_object(
          'completion_date', CURRENT_TIMESTAMP,
          'progress', NEW.progress
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성 (선택사항 - 자동 발급을 원하는 경우)
-- CREATE TRIGGER trg_auto_issue_certificate
-- AFTER UPDATE ON public.enrollments
-- FOR EACH ROW
-- EXECUTE FUNCTION auto_issue_certificate();