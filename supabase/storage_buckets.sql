-- Storage Buckets 생성
-- Supabase 대시보드에서 실행하거나 supabase CLI로 실행

-- 코스 썸네일 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-thumbnails',
  'course-thumbnails',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 강의 동영상 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-videos',
  'course-videos',
  false,
  1073741824, -- 1GB
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
) ON CONFLICT (id) DO NOTHING;

-- 프로필 이미지 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 강의 자료 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-resources',
  'course-resources',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/zip', 'application/x-zip-compressed', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
) ON CONFLICT (id) DO NOTHING;

-- Storage 정책 설정

-- 코스 썸네일: 누구나 볼 수 있지만 강사만 업로드 가능
CREATE POLICY "Course thumbnails are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-thumbnails');

CREATE POLICY "Instructors can upload course thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'course-thumbnails' AND
    auth.uid() IN (
      SELECT user_id FROM public.instructor_profiles
    )
  );

CREATE POLICY "Instructors can update their course thumbnails" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'course-thumbnails' AND
    auth.uid() IN (
      SELECT user_id FROM public.instructor_profiles
    )
  );

-- 강의 동영상: 수강생만 접근 가능, 강사만 업로드 가능
CREATE POLICY "Students can view enrolled course videos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'course-videos' AND
    auth.uid() IN (
      SELECT e.user_id 
      FROM public.enrollments e
      JOIN public.lessons l ON l.course_id = e.course_id
      WHERE storage.foldername(name) = l.course_id::text
    )
  );

CREATE POLICY "Instructors can manage course videos" ON storage.objects
  FOR ALL USING (
    bucket_id = 'course-videos' AND
    auth.uid() IN (
      SELECT ip.user_id 
      FROM public.instructor_profiles ip
      JOIN public.courses c ON c.instructor_id = ip.id
      WHERE storage.foldername(name) = c.id::text
    )
  );

-- 아바타: 모두 볼 수 있고, 본인 것만 업로드/수정 가능
CREATE POLICY "Avatars are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    storage.foldername(name) = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    storage.foldername(name) = auth.uid()::text
  );

-- 강의 자료: 수강생만 다운로드 가능, 강사만 업로드 가능
CREATE POLICY "Students can download enrolled course resources" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'course-resources' AND
    auth.uid() IN (
      SELECT e.user_id 
      FROM public.enrollments e
      WHERE storage.foldername(name) = e.course_id::text
    )
  );

CREATE POLICY "Instructors can manage course resources" ON storage.objects
  FOR ALL USING (
    bucket_id = 'course-resources' AND
    auth.uid() IN (
      SELECT ip.user_id 
      FROM public.instructor_profiles ip
      JOIN public.courses c ON c.instructor_id = ip.id
      WHERE storage.foldername(name) = c.id::text
    )
  );