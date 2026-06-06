import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';

  // Skip static files, api routes, public paths
  const excludePaths = [
    '/_next',
    '/api',
    '/static',
    '/favicon.ico',
    '/teams/login',
    '/teams/dashboard',
    '/login',
    '/register',
    '/setup-wizard'
  ];

  if (excludePaths.some(path => url.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Subdomain resolution logic
  let subdomain = '';
  const domainParts = host.split('.');

  // e.g. tenant.localhost:3000 or tenant.aurxon.com
  if (domainParts.length > 1) {
    const isLocalhost = host.includes('localhost');
    // For localhost: subdomain.localhost:3000 -> parts are ['subdomain', 'localhost:3000']
    // For production: subdomain.aurxon.com -> parts are ['subdomain', 'aurxon', 'com']
    if (isLocalhost) {
      if (domainParts.length >= 2 && domainParts[1].startsWith('localhost')) {
        subdomain = domainParts[0];
      }
    } else {
      if (domainParts.length >= 3) {
        subdomain = domainParts[0];
      }
    }
  }

  // Filter out www or empty subdomains
  if (subdomain && subdomain !== 'www') {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-slug', subdomain);

    // Continue with modified request headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /static (inside public)
     * 4. all static files (e.g. .svg, .png, .jpg, .jpeg, .gif, .webp, .css, .js)
     */
    '/((?!api|_next|static|.*\\..*$).*)',
  ],
};
