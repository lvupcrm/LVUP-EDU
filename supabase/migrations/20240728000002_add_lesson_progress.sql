-- Lesson Progress Tracking
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  
  -- 진도 정보
  status TEXT DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')),
  watched_seconds INTEGER DEFAULT 0,
  total_seconds INTEGER,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- 마지막 시청 위치
  last_position INTEGER DEFAULT 0,
  
  -- 완료 정보
  completed_at TIMESTAMPTZ,
  completion_count INTEGER DEFAULT 0,
  
  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(enrollment_id, lesson_id)
);

-- 인덱스 추가
CREATE INDEX idx_lesson_progress_enrollment ON public.lesson_progress(enrollment_id);
CREATE INDEX idx_lesson_progress_lesson ON public.lesson_progress(lesson_id);
CREATE INDEX idx_lesson_progress_status ON public.lesson_progress(status);

-- RLS 정책
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 진도만 볼 수 있음
CREATE POLICY "Users can view own progress" ON public.lesson_progress
  FOR SELECT USING (
    enrollment_id IN (
      SELECT id FROM public.enrollments 
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- 사용자는 자신의 진도만 업데이트할 수 있음
CREATE POLICY "Users can update own progress" ON public.lesson_progress
  FOR UPDATE USING (
    enrollment_id IN (
      SELECT id FROM public.enrollments 
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- 사용자는 자신의 진도만 생성할 수 있음
CREATE POLICY "Users can insert own progress" ON public.lesson_progress
  FOR INSERT WITH CHECK (
    enrollment_id IN (
      SELECT id FROM public.enrollments 
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- 동영상 스트리밍을 위한 lessons 테이블 업데이트
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS video_provider TEXT DEFAULT 'cloudflare' CHECK (video_provider IN ('cloudflare', 'youtube', 'vimeo', 'direct')),
ADD COLUMN IF NOT EXISTS video_id TEXT,
ADD COLUMN IF NOT EXISTS video_duration INTEGER, -- 초 단위
ADD COLUMN IF NOT EXISTS video_thumbnail TEXT,
ADD COLUMN IF NOT EXISTS video_quality JSONB DEFAULT '{"360p": true, "720p": true, "1080p": true}'::jsonb;

-- 진도 업데이트 함수
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  new_progress DECIMAL(5,2);
BEGIN
  -- 전체 레슨 수 계산
  SELECT COUNT(*) INTO total_lessons
  FROM public.lessons
  WHERE course_id = (
    SELECT course_id FROM public.enrollments WHERE id = NEW.enrollment_id
  );
  
  -- 완료된 레슨 수 계산
  SELECT COUNT(*) INTO completed_lessons
  FROM public.lesson_progress
  WHERE enrollment_id = NEW.enrollment_id
  AND status = 'COMPLETED';
  
  -- 진도율 계산
  IF total_lessons > 0 THEN
    new_progress := (completed_lessons::DECIMAL / total_lessons) * 100;
  ELSE
    new_progress := 0;
  END IF;
  
  -- enrollments 테이블 업데이트
  UPDATE public.enrollments
  SET progress = new_progress,
      completed_at = CASE 
        WHEN new_progress >= 100 THEN NOW() 
        ELSE NULL 
      END,
      status = CASE 
        WHEN new_progress >= 100 THEN 'COMPLETED' 
        ELSE status 
      END
  WHERE id = NEW.enrollment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE TRIGGER update_enrollment_progress_trigger
AFTER INSERT OR UPDATE ON public.lesson_progress
FOR EACH ROW
EXECUTE FUNCTION update_enrollment_progress();

-- 통계 뷰 생성
CREATE OR REPLACE VIEW public.course_statistics AS
SELECT 
  c.id,
  c.title,
  COUNT(DISTINCT e.user_id) as total_students,
  COUNT(DISTINCT CASE WHEN e.status = 'COMPLETED' THEN e.user_id END) as completed_students,
  AVG(e.progress) as average_progress,
  COUNT(DISTINCT lp.lesson_id) as lessons_watched,
  SUM(lp.watched_seconds) / 3600.0 as total_watch_hours
FROM public.courses c
LEFT JOIN public.enrollments e ON c.id = e.course_id
LEFT JOIN public.lesson_progress lp ON e.id = lp.enrollment_id
GROUP BY c.id, c.title;

-- 강사가 자신의 강의 통계를 볼 수 있도록 RLS 정책 추가
CREATE POLICY "Instructors can view own course statistics" ON public.courses
  FOR SELECT USING (
    instructor_id IN (
      SELECT id FROM public.instructor_profiles 
      WHERE user_id = (SELECT auth.uid())
    )
  );