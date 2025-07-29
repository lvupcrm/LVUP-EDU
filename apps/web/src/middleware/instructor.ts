import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function checkInstructorAuth() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return {
      authorized: false,
      redirect: '/auth/login'
    }
  }

  // 강사 프로필 확인
  const { data: instructorProfile } = await supabase
    .from('instructor_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!instructorProfile) {
    return {
      authorized: false,
      redirect: '/become-instructor'
    }
  }

  return {
    authorized: true,
    user,
    instructorId: instructorProfile.id
  }
}