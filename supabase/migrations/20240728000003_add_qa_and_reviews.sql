-- Q&A 시스템
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- 상태
  is_resolved BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  
  -- 통계
  view_count INTEGER DEFAULT 0,
  answer_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 답변
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  content TEXT NOT NULL,
  
  -- 상태
  is_accepted BOOLEAN DEFAULT FALSE,
  is_instructor_answer BOOLEAN DEFAULT FALSE,
  
  -- 통계
  vote_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 투표 (도움이 됐어요)
CREATE TABLE public.answer_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  answer_id UUID REFERENCES public.answers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  is_helpful BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(answer_id, user_id)
);

-- 리뷰 시스템
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE NOT NULL,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  
  -- 추가 평가
  would_recommend BOOLEAN DEFAULT TRUE,
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  
  -- 통계
  helpful_count INTEGER DEFAULT 0,
  
  -- 상태
  is_verified BOOLEAN DEFAULT FALSE, -- 실제 수강 완료 후 작성한 리뷰
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(course_id, user_id)
);

-- 리뷰 도움이 됐어요
CREATE TABLE public.review_helpful (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(review_id, user_id)
);

-- 인덱스 추가
CREATE INDEX idx_questions_course ON public.questions(course_id);
CREATE INDEX idx_questions_user ON public.questions(user_id);
CREATE INDEX idx_questions_lesson ON public.questions(lesson_id);
CREATE INDEX idx_questions_created ON public.questions(created_at DESC);

CREATE INDEX idx_answers_question ON public.answers(question_id);
CREATE INDEX idx_answers_user ON public.answers(user_id);

CREATE INDEX idx_reviews_course ON public.reviews(course_id);
CREATE INDEX idx_reviews_user ON public.reviews(user_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);

-- RLS 정책

-- Questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public questions" ON public.questions
  FOR SELECT USING (NOT is_private OR user_id = auth.uid());

CREATE POLICY "Enrolled users can create questions" ON public.questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.enrollments 
      WHERE course_id = questions.course_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own questions" ON public.questions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own questions" ON public.questions
  FOR DELETE USING (user_id = auth.uid());

-- Answers
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view answers" ON public.answers
  FOR SELECT USING (true);

CREATE POLICY "Enrolled users and instructors can create answers" ON public.answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.questions q
      JOIN public.enrollments e ON e.course_id = q.course_id
      WHERE q.id = answers.question_id
      AND e.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.questions q
      JOIN public.courses c ON c.id = q.course_id
      JOIN public.instructor_profiles ip ON ip.id = c.instructor_id
      WHERE q.id = answers.question_id
      AND ip.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own answers" ON public.answers
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own answers" ON public.answers
  FOR DELETE USING (user_id = auth.uid());

-- Answer Votes
ALTER TABLE public.answer_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes" ON public.answer_votes
  FOR SELECT USING (true);

CREATE POLICY "Enrolled users can vote" ON public.answer_votes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.answers a
      JOIN public.questions q ON q.id = a.question_id
      JOIN public.enrollments e ON e.course_id = q.course_id
      WHERE a.id = answer_votes.answer_id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can change own votes" ON public.answer_votes
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own votes" ON public.answer_votes
  FOR DELETE USING (user_id = auth.uid());

-- Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Enrolled users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.enrollments 
      WHERE id = reviews.enrollment_id 
      AND user_id = auth.uid()
      AND progress >= 20 -- 최소 20% 이상 수강
    )
  );

CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own reviews" ON public.reviews
  FOR DELETE USING (user_id = auth.uid());

-- Review Helpful
ALTER TABLE public.review_helpful ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view helpful votes" ON public.review_helpful
  FOR SELECT USING (true);

CREATE POLICY "Users can mark reviews helpful" ON public.review_helpful
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can remove helpful votes" ON public.review_helpful
  FOR DELETE USING (user_id = auth.uid());

-- 트리거 함수들

-- 답변 수 업데이트
CREATE OR REPLACE FUNCTION update_answer_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.questions 
    SET answer_count = answer_count + 1
    WHERE id = NEW.question_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.questions 
    SET answer_count = answer_count - 1
    WHERE id = OLD.question_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_answer_count_trigger
AFTER INSERT OR DELETE ON public.answers
FOR EACH ROW
EXECUTE FUNCTION update_answer_count();

-- 투표 수 업데이트
CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.answers 
    SET vote_count = vote_count + 1
    WHERE id = NEW.answer_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.answers 
    SET vote_count = vote_count - 1
    WHERE id = OLD.answer_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_vote_count_trigger
AFTER INSERT OR DELETE ON public.answer_votes
FOR EACH ROW
EXECUTE FUNCTION update_vote_count();

-- 리뷰 통계 업데이트
CREATE OR REPLACE FUNCTION update_course_review_stats()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  review_cnt INTEGER;
BEGIN
  SELECT 
    AVG(rating),
    COUNT(*)
  INTO avg_rating, review_cnt
  FROM public.reviews
  WHERE course_id = COALESCE(NEW.course_id, OLD.course_id);
  
  UPDATE public.courses
  SET 
    average_rating = COALESCE(avg_rating, 0),
    review_count = COALESCE(review_cnt, 0)
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_course_review_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_course_review_stats();

-- 리뷰 도움이 됐어요 수 업데이트
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reviews 
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reviews 
    SET helpful_count = helpful_count - 1
    WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_review_helpful_count_trigger
AFTER INSERT OR DELETE ON public.review_helpful
FOR EACH ROW
EXECUTE FUNCTION update_review_helpful_count();