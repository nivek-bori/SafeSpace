import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { isAuthorized } from '../util/client_util';
import { UserRole } from '@/types/types';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip middleware check. You can remove this once you setup the project.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse;
  }

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // START OF CODE YOU CAN EDIT

  /* 
		if the user is not signed in and is trying to access a non-guest (non-signed in) route, redirect them to sign in
		if the user is signed in but does not have the authorization, redirect them to home with a message
		otherwise allow the request
	*/

  // Easy of development - if enable -> TODO: REMOVE
  if (process.env.NODE_ENV === 'development') {
    console.log('middleware skipped due to development environment');
    return supabaseResponse;
  }

  const privateRoutes: Record<string, UserRole> = {
    '/api': 'USER',
    '/dashboard': 'USER',
    '/developer': 'ADMIN',
  };

  const pathname = request.nextUrl.pathname;

  // loop over all protected routes
  for (const [route, requiredRole] of Object.entries(privateRoutes)) {
    // if requested reoute is protected, then check authorization
    if (pathname.startsWith(route)) {
      if (!user) {
        console.log('middleware no user redirect'); // TODO: REMOVE
        const url = request.nextUrl.clone();
        url.pathname = '/signin';
        return NextResponse.redirect(url);
      } else {
        if (isAuthorized(user?.role, requiredRole)) {
          console.log('middleware user redirect'); // TODO: REMOVE
          const url = request.nextUrl.clone();
          url.pathname = '/';
          url.searchParams.set('message', 'You do not have access to this page');
          return NextResponse.redirect(url);
        }
      }
    }
  }

  // END OF CODE YOU CAN EDIT

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
