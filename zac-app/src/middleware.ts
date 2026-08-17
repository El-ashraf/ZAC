import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('zac_auth')?.value;
  const { pathname } = request.nextUrl;

  // Let public assets and APIs go through
  const isApiOrStatic = 
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname.includes('.') || 
    pathname === '/favicon.ico';

  if (isApiOrStatic) {
    return NextResponse.next();
  }

  // Public pages: Landing page (/) and Login page (/login)
  const isLandingPage = pathname === '/';
  const isLoginPage = pathname.startsWith('/login');

  if (isLoginPage && token) {
    // If already logged in, skip login page and go to dashboard
    const payload = await verifySessionToken(token);
    if (payload) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Allow access to landing page or login page without token
  if (isLandingPage || isLoginPage) {
    return NextResponse.next();
  }

  // Route is protected, check token
  if (!token) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    // Invalid session cookie, redirect to login and clear the cookie
    const response = NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
    response.cookies.delete('zac_auth');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except API, Next static files, Next images, and Favicon
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
