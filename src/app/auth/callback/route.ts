import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';

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
      const userEmail = data.user.email?.toLowerCase();

      // Check if user is Admin or Super Admin
      if (userEmail === 'orukari878@gmail.com') {
        return NextResponse.redirect(`${origin}/admin`);
      }

      // Query role from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, admin_permission')
        .eq('id', data.user.id)
        .single();

      if (profile?.role === 'ADMIN' || profile?.admin_permission) {
        return NextResponse.redirect(`${origin}/admin`);
      } else if (profile?.role === 'WRITER') {
        return NextResponse.redirect(`${origin}/writer-dashboard`);
      } else {
        return NextResponse.redirect(`${origin}/dashboard`);
      }
    }
  }

  // Return the user to an error or default landing page
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
