-- Create function to get instructors with course count in a single query
-- This replaces the N+1 query pattern in the instructors page

CREATE OR REPLACE FUNCTION get_instructors_with_course_count()
RETURNS TABLE (
  id UUID,
  bio TEXT,
  experience_years INTEGER,
  user_id UUID,
  user_name TEXT,
  user_avatar TEXT,
  user_specialties TEXT[],
  user_location TEXT,
  course_count BIGINT
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    ip.id,
    ip.bio,
    ip.experience_years,
    ip.user_id,
    u.name as user_name,
    u.avatar as user_avatar,
    u.specialties as user_specialties,
    u.location as user_location,
    COALESCE(c.course_count, 0) as course_count
  FROM instructor_profiles ip
  LEFT JOIN users u ON ip.user_id = u.id
  LEFT JOIN (
    SELECT 
      instructor_id,
      COUNT(*) as course_count
    FROM courses
    GROUP BY instructor_id
  ) c ON ip.id = c.instructor_id
  ORDER BY ip.experience_years DESC NULLS LAST;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_instructors_with_course_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_instructors_with_course_count() TO anon;