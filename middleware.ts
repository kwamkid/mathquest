// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ✅ Admin routes - bypass all checks
  if (pathname.startsWith('/admin')) {
    // Set header เพื่อบอกว่าเป็น admin route
    const response = NextResponse.next();
    response.headers.set('x-is-admin-route', 'true');
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};