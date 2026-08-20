import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  
  let origin = requestUrl.origin;
  if (forwardedHost) {
    origin = `${forwardedProto}://${forwardedHost}`;
  } else if (process.env.NEXT_PUBLIC_SITE_URL) {
    origin = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  } else if (origin.includes('localhost') && process.env.NODE_ENV === 'production') {
    origin = 'https://study-note-hub.vercel.app';
  }

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const userEmail = data.user.email?.toLowerCase() || '';

      // Super Admin bypasses verification
      if (userEmail === 'orukari878@gmail.com') {
        return NextResponse.redirect(`${origin}/admin`);
      }

      // Query profile from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, admin_permission, is_email_verified')
        .eq('id', data.user.id)
        .single();

      // Check if user has verified their email (or confirmed via email link)
      const isConfirmedBySupabase = Boolean(data.user.email_confirmed_at);
      const isEmailVerified = profile?.is_email_verified || isConfirmedBySupabase;

      if (isEmailVerified) {
        if (!profile?.is_email_verified) {
          await supabase.from('profiles').update({ is_email_verified: true }).eq('id', data.user.id);
        }

        // Route according to verified role
        if (profile?.role === 'ADMIN' && profile?.admin_permission) {
          return NextResponse.redirect(`${origin}/admin`);
        } else if (profile?.role === 'WRITER' || data.user.user_metadata?.role === 'WRITER') {
          return NextResponse.redirect(`${origin}/writer-dashboard`);
        } else {
          return NextResponse.redirect(`${origin}/dashboard`);
        }
      } else {
        // Trigger verification OTP/link to the user's email
        try {
          await supabase.auth.signInWithOtp({
            email: userEmail,
            options: {
              shouldCreateUser: false,
            },
          });
        } catch (e) {
          console.error('Error sending OTP during Google callback:', e);
        }

        // Redirect to email verification screen
        return NextResponse.redirect(
          `${origin}/verify-email?email=${encodeURIComponent(userEmail)}&provider=google`
        );
      }
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
