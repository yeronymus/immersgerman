import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Read the admin path from env (defaults to '/admin')
  const configuredAdminPath = process.env.ADMIN_PATH || '/admin';

  // 1. If someone accesses the raw '/admin' path and it is NOT the configured path, return a 404
  if (configuredAdminPath !== '/admin' && (pathname === '/admin' || pathname.startsWith('/admin/'))) {
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  // 2. Intercept the custom secret admin path
  if (pathname === configuredAdminPath || pathname.startsWith(configuredAdminPath + '/')) {
    const relativePath = pathname.substring(configuredAdminPath.length) || '/';
    
    // We rewrite the custom secret path to internal '/admin' routes
    const internalUrl = new URL('/admin' + relativePath, request.url);

    // Skip auth check for login routes
    if (relativePath === '/login' || relativePath.startsWith('/login/')) {
      return NextResponse.rewrite(internalUrl);
    }

    // Check JWT session cookie
    const token = request.cookies.get('admin_session')?.value;
    const isAuthorized = token ? await verifyToken(token) : false;

    if (!isAuthorized) {
      // Redirect to login page under the custom secret URL path
      return NextResponse.redirect(new URL(configuredAdminPath + '/login', request.url));
    }

    // Rewrite request internally to App Router's /admin path
    return NextResponse.rewrite(internalUrl);
  }

  // 3. Secure API routes starting with /api/admin/
  if (pathname.startsWith('/api/admin/')) {
    // Skip auth check for API login route
    if (pathname === '/api/admin/login') {
      return NextResponse.next();
    }

    const token = request.cookies.get('admin_session')?.value;
    const isAuthorized = token ? await verifyToken(token) : false;

    if (!isAuthorized) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to custom paths, admin path, and api/admin endpoints
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    // We must match all paths to dynamically intercept the custom ADMIN_PATH
    // To optimize performance, we skip static files and public pages that do not start with a slash
    '/:path*'
  ],
};
