import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');

  // 에러가 있는 경우 처리
  if (error) {
    console.error('OAuth callback error:', error, error_description);
    const redirectTo = new URL('/auth/error', request.url);
    redirectTo.searchParams.set('error', error);
    if (error_description) {
      redirectTo.searchParams.set('error_description', error_description);
    }
    return NextResponse.redirect(redirectTo);
  }

  if (code) {
    const supabase = getSupabaseClient();

    if (!supabase) {
      console.error('Supabase client not available');
      const redirectTo = new URL('/auth/error', request.url);
      redirectTo.searchParams.set('error', 'Service unavailable');
      return NextResponse.redirect(redirectTo);
    }

    try {
      const { data, error: sessionError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) {
        console.error('Session exchange error:', sessionError);
        const redirectTo = new URL('/auth/error', request.url);
        redirectTo.searchParams.set('error', sessionError.message);
        return NextResponse.redirect(redirectTo);
      }

      if (data?.user) {
        // 사용자 정보 확인
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        // 프로필이 없거나 불완전한 경우 프로필 완성 페이지로 리다이렉트
        if (userError || !userData || !userData.name || !userData.user_type) {
          console.log('Profile incomplete, redirecting to complete-profile');

          // users 테이블에 기본 정보 생성 (없는 경우)
          if (userError?.code === 'PGRST116') {
            // Not found error
            const { error: insertError } = await supabase.from('users').insert({
              id: data.user.id,
              email: data.user.email!,
              name:
                data.user.user_metadata?.full_name ||
                data.user.user_metadata?.name ||
                '',
              avatar:
                data.user.user_metadata?.avatar_url ||
                data.user.user_metadata?.picture ||
                null,
              role: 'STUDENT',
              user_type: 'TRAINER', // 기본값
              status: 'ACTIVE',
              provider_id: data.user.app_metadata?.provider || 'kakao',
            });

            if (insertError) {
              console.error('Error creating user profile:', insertError);
            }
          }

          const redirectTo = new URL('/auth/complete-profile', request.url);
          return NextResponse.redirect(redirectTo);
        }

        // 프로필이 완성된 경우 원래 목적지로 리다이렉트
        const redirectTo = new URL(next, request.url);
        return NextResponse.redirect(redirectTo);
      }
    } catch (err) {
      console.error('OAuth callback error:', err);
      const redirectTo = new URL('/auth/error', request.url);
      redirectTo.searchParams.set('error', 'Authentication failed');
      return NextResponse.redirect(redirectTo);
    }
  }

  // code가 없는 경우 에러 페이지로 리다이렉트
  const redirectTo = new URL('/auth/error', request.url);
  redirectTo.searchParams.set('error', 'No authorization code provided');
  return NextResponse.redirect(redirectTo);
}
