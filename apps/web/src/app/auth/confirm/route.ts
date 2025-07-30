import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/';

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;

  if (token_hash && type) {
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (!error) {
      redirectTo.pathname = '/auth/welcome';
      redirectTo.searchParams.set('emailConfirmed', 'true');
      return Response.redirect(redirectTo);
    } else {
      // 에러 처리
      redirectTo.pathname = '/auth/error';
      redirectTo.searchParams.set('error', error.message);
      return Response.redirect(redirectTo);
    }
  }

  // URL에 토큰이 없는 경우 에러 페이지로 리다이렉트
  redirectTo.pathname = '/auth/error';
  redirectTo.searchParams.set('error', 'Invalid confirmation link');
  return Response.redirect(redirectTo);
}
