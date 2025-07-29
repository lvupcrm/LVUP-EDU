-- 샘플 레슨 데이터 추가
-- 이미 courses, instructor_profiles 데이터가 있다고 가정

DO $$
DECLARE
  course_id UUID;
  course_record RECORD;
BEGIN
  -- 각 코스에 대해 레슨 추가
  FOR course_record IN SELECT id, title FROM public.courses LIMIT 3
  LOOP
    -- 코스별로 5개의 레슨 추가
    INSERT INTO public.lessons (course_id, title, description, order_num, duration, video_url, content, is_preview, video_provider, video_duration)
    VALUES 
      (course_record.id, '오리엔테이션', '강의 소개 및 학습 방법 안내', 1, 15, 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 
       '<h3>환영합니다!</h3><p>이 강의에서는 다음과 같은 내용을 학습합니다...</p>', true, 'direct', 596),
      
      (course_record.id, '기초 이론', '핵심 개념과 원리 이해하기', 2, 30, 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 
       '<h3>기초 이론</h3><p>이번 레슨에서는 기본 개념을 배웁니다...</p>', false, 'direct', 653),
      
      (course_record.id, '실습 준비', '실습 환경 세팅 및 도구 설명', 3, 20, 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 
       '<h3>실습 환경 구성</h3><p>실습을 위한 환경을 준비합니다...</p>', false, 'direct', 15),
      
      (course_record.id, '실전 실습', '실제 프로젝트 진행하기', 4, 45, 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 
       '<h3>실전 프로젝트</h3><p>이제 실제 프로젝트를 진행해봅시다...</p>', false, 'direct', 15),
      
      (course_record.id, '마무리', '핵심 내용 정리 및 다음 단계', 5, 10, 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 
       '<h3>수고하셨습니다!</h3><p>학습한 내용을 정리하고 다음 단계를 안내합니다...</p>', false, 'direct', 60);
  END LOOP;
END $$;

-- 샘플 학습 자료 추가
UPDATE public.lessons 
SET resources = '[
  {"title": "강의 슬라이드", "url": "https://example.com/slides.pdf"},
  {"title": "실습 코드", "url": "https://github.com/example/repo"},
  {"title": "참고 문서", "url": "https://docs.example.com"}
]'::jsonb
WHERE title = '실습 준비';