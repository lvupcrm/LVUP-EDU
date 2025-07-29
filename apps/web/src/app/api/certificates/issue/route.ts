import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { enrollmentId, userId, courseId } = await request.json()

    if (!enrollmentId || !userId || !courseId) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      )
    }

    // 수강 정보 확인
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('*')
      .eq('id', enrollmentId)
      .eq('user_id', userId)
      .single()

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        { error: '수강 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 수료 조건 확인
    if (enrollment.progress < 100 && enrollment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: '아직 코스를 완료하지 않았습니다.' },
        { status: 400 }
      )
    }

    // 기존 수료증 확인
    const { data: existingCert } = await supabase
      .from('certificates')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    if (existingCert) {
      return NextResponse.json({
        certificateId: existingCert.id,
        message: '이미 발급된 수료증이 있습니다.'
      })
    }

    // 수료증 번호 생성
    const { data: certNumber, error: fnError } = await supabase
      .rpc('generate_certificate_number')

    if (fnError || !certNumber) {
      throw new Error('수료증 번호 생성 실패')
    }

    // 수료증 발급
    const { data: certificate, error: insertError } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        course_id: courseId,
        enrollment_id: enrollmentId,
        certificate_number: certNumber,
        metadata: {
          completion_date: enrollment.completed_at || new Date().toISOString(),
          progress: enrollment.progress
        }
      })
      .select()
      .single()

    if (insertError || !certificate) {
      throw new Error('수료증 발급 실패')
    }

    // 수강 상태 업데이트 (아직 COMPLETED가 아닌 경우)
    if (enrollment.status !== 'COMPLETED') {
      await supabase
        .from('enrollments')
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString()
        })
        .eq('id', enrollmentId)
    }

    return NextResponse.json({
      certificateId: certificate.id,
      certificateNumber: certificate.certificate_number,
      message: '수료증이 성공적으로 발급되었습니다.'
    })

  } catch (error) {
    console.error('Certificate issue error:', error)
    return NextResponse.json(
      { error: '수료증 발급 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}