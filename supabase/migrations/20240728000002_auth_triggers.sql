-- ================================
-- Auth 연동 트리거 및 함수
-- ================================

-- 새 사용자가 auth.users에 생성될 때 public.users에도 자동 생성하는 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- auth.users에 새 레코드가 삽입될 때 트리거 실행
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================
-- RLS 정책 추가
-- ================================

-- 사용자는 자신의 데이터만 볼 수 있도록 정책 추가
CREATE POLICY "Enable insert for authenticated users only" ON public.users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 강사는 자신의 프로필만 수정 가능
CREATE POLICY "Instructors can insert own profile" ON public.instructor_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Instructors can update own profile" ON public.instructor_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 강의는 해당 강사만 수정 가능
CREATE POLICY "Instructors can insert own courses" ON public.courses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.instructor_profiles
      WHERE id = courses.instructor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can update own courses" ON public.courses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.instructor_profiles
      WHERE id = courses.instructor_id AND user_id = auth.uid()
    )
  );

-- 레슨은 해당 강의의 강사만 수정 가능
CREATE POLICY "Instructors can manage own lessons" ON public.lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      JOIN public.instructor_profiles ip ON c.instructor_id = ip.id
      WHERE c.id = lessons.course_id AND ip.user_id = auth.uid()
    )
  );

-- 수강 정보는 본인만 접근 가능
CREATE POLICY "Users can manage own enrollments" ON public.enrollments
  FOR ALL USING (auth.uid() = user_id);

-- 진도는 본인만 접근 가능
CREATE POLICY "Users can manage own progress" ON public.progress
  FOR ALL USING (auth.uid() = user_id);

-- 리뷰는 본인만 작성/수정 가능, 모든 사람이 읽기 가능
CREATE POLICY "Anyone can read reviews" ON public.reviews
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- 알림은 본인만 접근 가능
CREATE POLICY "Users can manage own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- 결제는 본인만 접근 가능
CREATE POLICY "Users can manage own payments" ON public.payments
  FOR ALL USING (auth.uid() = user_id);