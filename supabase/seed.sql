-- ================================
-- 시드 데이터 생성
-- ================================

-- 1. 카테고리 생성 (auth와 독립적)
INSERT INTO public.categories (name, slug, description, type, icon, color, order_num) VALUES
  ('기초 지식', 'basic-knowledge', '트레이너 기초 지식', 'TRAINER', '📚', '#3B82F6', 1),
  ('자격증', 'certifications', '각종 자격증 과정', 'TRAINER', '🏆', '#10B981', 2),
  ('센터 운영', 'center-management', '피트니스 센터 운영', 'OPERATOR', '🏢', '#F59E0B', 3),
  ('특수 집단', 'special-populations', '고령자, 재활 운동', 'TRAINER', '🏥', '#EF4444', 4),
  ('영양 지도', 'nutrition-guidance', '식단 및 영양 관리', 'TRAINER', '🥗', '#8B5CF6', 5);

-- 2. 강사 사용자를 위한 함수 생성 (실제 사용자 생성 후 호출할 함수)
CREATE OR REPLACE FUNCTION create_sample_instructor_data(instructor_user_id UUID)
RETURNS VOID AS $$
DECLARE
    instructor_profile_id UUID;
    basic_category_id UUID;
    cert_category_id UUID;
    course1_id UUID;
    course2_id UUID;
    course3_id UUID;
BEGIN
    -- 카테고리 ID 가져오기
    SELECT id INTO basic_category_id FROM public.categories WHERE slug = 'basic-knowledge';
    SELECT id INTO cert_category_id FROM public.categories WHERE slug = 'certifications';

    -- 사용자 정보 업데이트
    UPDATE public.users SET
        name = '김트레이너',
        role = 'INSTRUCTOR',
        user_type = 'TRAINER',
        introduction = '15년 경력의 퍼스널 트레이닝 전문가로, CPT-NASM 자격증을 보유하고 있습니다.',
        specialties = '["PT", "웨이트 트레이닝", "재활"]'::jsonb,
        experience = 15,
        location = '서울'
    WHERE id = instructor_user_id;

    -- 강사 프로필 생성
    INSERT INTO public.instructor_profiles (
        user_id, status, title, bio, expertise, achievements, educations, approved_at
    ) VALUES (
        instructor_user_id,
        'APPROVED',
        '피트니스 전문가',
        '15년 경력의 퍼스널 트레이닝 전문가입니다. 체계적인 운동 프로그램과 올바른 식단 관리를 통해 수많은 회원들의 건강한 변화를 도왔습니다.',
        '["웨이트 트레이닝", "재활 운동", "다이어트", "근력 향상", "체형 교정"]'::jsonb,
        '["CPT-NASM 자격증 보유", "15년 트레이닝 경력", "1000명+ 회원 지도", "체육대학 우수졸업", "재활운동 전문과정 수료"]'::jsonb,
        '["체육대학 운동학과 졸업", "NASM 인증 퍼스널트레이너", "재활운동사 자격증", "스포츠영양사 자격증"]'::jsonb,
        NOW()
    ) RETURNING id INTO instructor_profile_id;

    -- 강의 생성
    INSERT INTO public.courses (
        title, slug, description, status, level, duration, price, is_free, 
        instructor_id, category_id, published_at
    ) VALUES (
        '피트니스 트레이너 기초 과정',
        'fitness-trainer-basic',
        '피트니스 트레이너로 시작하기 위한 기본 지식과 실무 스킬을 배우는 완전 초보자를 위한 강의입니다.',
        'PUBLISHED', 'BEGINNER', 1200, 99000, false,
        instructor_profile_id, basic_category_id, NOW()
    ) RETURNING id INTO course1_id;

    INSERT INTO public.courses (
        title, slug, description, status, level, duration, price, is_free,
        instructor_id, category_id, published_at
    ) VALUES (
        'CPT 자격증 완전 정복',
        'cpt-certification-complete',
        'CPT 자격증 취득을 위한 체계적인 학습 과정과 실전 문제 풀이로 합격을 보장합니다.',
        'PUBLISHED', 'INTERMEDIATE', 1800, 149000, false,
        instructor_profile_id, cert_category_id, NOW()
    ) RETURNING id INTO course2_id;

    INSERT INTO public.courses (
        title, slug, description, status, level, duration, price, is_free,
        instructor_id, category_id, published_at
    ) VALUES (
        '운동 해부학 기초',
        'anatomy-basics',
        '트레이너가 반드시 알아야 할 인체 구조와 운동 시 근육의 작용을 쉽게 배워보세요.',
        'PUBLISHED', 'BEGINNER', 600, 0, true,
        instructor_profile_id, basic_category_id, NOW()
    ) RETURNING id INTO course3_id;

    -- 레슨 생성
    -- 첫 번째 강의 레슨들
    INSERT INTO public.lessons (course_id, title, description, order_num, duration, is_preview) VALUES
        (course1_id, '트레이너 기초 개념', '피트니스 트레이너가 알아야 할 기본 개념들을 학습합니다', 1, 45, true),
        (course1_id, '해부학 기초', '인체의 기본 구조와 근육계를 이해합니다', 2, 60, false),
        (course1_id, '운동생리학 개론', '운동 시 신체 반응과 적응을 학습합니다', 3, 50, false),
        (course1_id, '안전 관리와 응급처치', '운동 중 안전 관리와 응급상황 대처법을 배웁니다', 4, 40, false);

    -- 두 번째 강의 레슨들
    INSERT INTO public.lessons (course_id, title, description, order_num, duration, is_preview) VALUES
        (course2_id, 'CPT 시험 개요', 'CPT 자격증 시험의 구성과 준비 전략을 알아봅니다', 1, 30, true),
        (course2_id, '해부학 심화', '시험에 나오는 해부학 핵심 내용을 정리합니다', 2, 90, false),
        (course2_id, '운동생리학 심화', '심화된 운동생리학 이론을 학습합니다', 3, 85, false),
        (course2_id, '실전 문제 풀이', 'CPT 시험 기출문제와 예상문제를 풀어봅니다', 4, 120, false);

    -- 세 번째 강의 레슨들 (무료 강의)
    INSERT INTO public.lessons (course_id, title, description, order_num, duration, is_preview) VALUES
        (course3_id, '인체의 기본 구조', '뼈, 근육, 관절의 기본 구조를 알아봅니다', 1, 20, true),
        (course3_id, '주요 근육군 이해', '운동에 중요한 주요 근육군을 학습합니다', 2, 25, true),
        (course3_id, '관절의 움직임', '관절의 종류와 움직임 범위를 학습합니다', 3, 30, false);

    -- 강사 프로필 통계 업데이트
    UPDATE public.instructor_profiles 
    SET total_courses = 3, total_students = 0, average_rating = 4.8
    WHERE id = instructor_profile_id;

    -- 강의 통계 업데이트
    UPDATE public.courses SET average_rating = 4.9, review_count = 42, enrollment_count = 156 WHERE id = course1_id;
    UPDATE public.courses SET average_rating = 4.7, review_count = 38, enrollment_count = 124 WHERE id = course2_id;
    UPDATE public.courses SET average_rating = 4.8, review_count = 89, enrollment_count = 234 WHERE id = course3_id;

END;
$$ LANGUAGE plpgsql;

-- 3. 사용법 안내 (실제 사용자 생성 후 실행)
-- 실제 사용자가 회원가입한 후 해당 사용자의 UUID로 다음 함수를 호출:
-- SELECT create_sample_instructor_data('실제_사용자_UUID');

-- 4. UUID 확장 활성화 (uuid_generate_v4 함수 사용을 위해)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 5. 데모 강사 계정 생성 함수 (실제 사용 시 호출)
CREATE OR REPLACE FUNCTION create_demo_instructor()
RETURNS UUID AS $$
DECLARE
    demo_user_id UUID;
    demo_instructor_id UUID;
BEGIN
    -- 먼저 auth.users에 사용자를 생성해야 합니다
    -- Supabase Dashboard > Authentication > Users에서 수동으로 생성하거나
    -- 프론트엔드에서 회원가입을 통해 생성한 후
    -- 해당 사용자의 UUID를 이 함수에 전달하면 됩니다
    
    -- 예시: SELECT create_demo_instructor_with_id('생성된_사용자_UUID');
    
    RETURN demo_user_id;
END;
$$ LANGUAGE plpgsql;

-- 6. 실제 사용자 ID를 받아서 데모 강사로 만드는 함수
CREATE OR REPLACE FUNCTION create_demo_instructor_with_id(demo_user_id UUID)
RETURNS VOID AS $$
DECLARE
    demo_instructor_id UUID;
    basic_category_id UUID;
    cert_category_id UUID;
    center_category_id UUID;
    special_category_id UUID;
    nutrition_category_id UUID;
BEGIN
    -- 카테고리 ID들 가져오기
    SELECT id INTO basic_category_id FROM public.categories WHERE slug = 'basic-knowledge';
    SELECT id INTO cert_category_id FROM public.categories WHERE slug = 'certifications';
    SELECT id INTO center_category_id FROM public.categories WHERE slug = 'center-management';
    SELECT id INTO special_category_id FROM public.categories WHERE slug = 'special-populations';
    SELECT id INTO nutrition_category_id FROM public.categories WHERE slug = 'nutrition-guidance';

    -- 사용자 정보 업데이트
    UPDATE public.users SET
        name = '데모 강사',
        role = 'INSTRUCTOR',
        user_type = 'TRAINER',
        introduction = '데모용 강사 계정입니다.',
        experience = 10,
        location = '서울'
    WHERE id = demo_user_id;

    -- 데모 강사 프로필 생성
    INSERT INTO public.instructor_profiles (
        user_id, status, title, bio, total_courses, total_students, average_rating
    ) VALUES (
        demo_user_id,
        'APPROVED',
        '데모 강사',
        '샘플 데이터용 강사 프로필입니다.',
        3, 0, 4.5
    ) RETURNING id INTO demo_instructor_id;

    -- 추가 샘플 강의 생성
    INSERT INTO public.courses (
        title, slug, description, status, level, duration, price, is_free,
        instructor_id, category_id, published_at, is_public
    ) VALUES 
    (
        '센터 운영 실무 가이드',
        'fitness-center-management',
        '피트니스 센터 운영에 필요한 실무 지식과 노하우를 배웁니다.',
        'PUBLISHED', 'INTERMEDIATE', 900, 89000, false,
        demo_instructor_id, center_category_id, NOW(), true
    ),
    (
        '고령자 운동 지도법',
        'senior-fitness-guide',
        '고령자를 위한 안전하고 효과적인 운동 프로그램 설계 방법을 학습합니다.',
        'PUBLISHED', 'ADVANCED', 720, 120000, false,
        demo_instructor_id, special_category_id, NOW(), true
    ),
    (
        '스포츠 영양학 기초',
        'sports-nutrition-basics',
        '운동과 영양의 관계, 효과적인 식단 관리 방법을 배워보세요.',
        'PUBLISHED', 'BEGINNER', 480, 0, true,
        demo_instructor_id, nutrition_category_id, NOW(), true
    );

    -- 레슨 추가
    INSERT INTO public.lessons (course_id, title, description, order_num, duration, is_preview)
    SELECT 
        c.id,
        '소개 영상',
        '강의 소개와 커리큘럼을 설명합니다.',
        1,
        15,
        true
    FROM public.courses c
    WHERE c.instructor_id = demo_instructor_id;

END;
$$ LANGUAGE plpgsql;

-- 7. 사용 방법 안내
-- 1) Supabase Dashboard > Authentication > Users에서 새 사용자 생성
-- 2) 생성된 사용자의 UUID 복사
-- 3) 다음 명령 실행:
--    SELECT create_demo_instructor_with_id('복사한_UUID');
--    SELECT create_sample_instructor_data('다른_사용자_UUID');