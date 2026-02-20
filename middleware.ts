import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { redirectMiddleware } from '@/lib/redirects';

export function middleware(request: NextRequest) {
  // Handle SEO redirects first
  const redirectResponse = redirectMiddleware(request);
  if (redirectResponse) {
    return redirectResponse;
  }

  // Continue with normal request processing
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
