import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DEV_EMAIL = 'mialilypucci@gmail.com';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Authenticated users visiting login or signup go straight to /host
  if (user && (pathname === '/' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/host', request.url));
  }

  // /host/* requires any authenticated user
  if (pathname.startsWith('/host') && !user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // /dev/* restricted to Mia's account only
  if (pathname.startsWith('/dev')) {
    if (!user || user.email !== DEV_EMAIL) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|g/).*)'],
};
