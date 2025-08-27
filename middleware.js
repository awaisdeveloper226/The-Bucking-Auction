import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();

  // Only protect /admin pages except /admin/login
  if (
    url.pathname.startsWith('/admin') &&
    url.pathname !== '/admin/login' // exclude login
  ) {
    const adminId = request.cookies.get('adminId')?.value;
    if (!adminId) {
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};