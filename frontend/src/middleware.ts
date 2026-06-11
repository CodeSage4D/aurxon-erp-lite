import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getSubdomainUrl(sub: string, path: string, request: NextRequest) {
  const host = request.headers.get('host') || '';
  const protocol = request.nextUrl.protocol || 'http:';
  const domainParts = host.split('.');
  const isLocalhost = host.includes('localhost');
  
  let baseDomain = '';
  if (isLocalhost) {
    baseDomain = host.includes('.') ? domainParts.slice(1).join('.') : host;
  } else {
    baseDomain = domainParts.length >= 3 ? domainParts.slice(domainParts.length - 2).join('.') : host;
  }
  
  return `${protocol}//${sub}.${baseDomain}${path}`;
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';

  // Skip static files, api routes, assets
  const excludePaths = [
    '/_next',
    '/api',
    '/static',
    '/favicon.ico',
  ];

  if (excludePaths.some(path => url.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Subdomain resolution logic
  let subdomain = '';
  const domainParts = host.split('.');

  if (domainParts.length > 1) {
    const isLocalhost = host.includes('localhost');
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

  subdomain = subdomain.trim().toLowerCase();

  // 1. Enforce Founder OS boundaries
  if (subdomain === 'portal' || subdomain === 'founder') {
    const allowedFounderPaths = ['/founder', '/founder-console', '/api', '/_next', '/static', '/favicon.ico'];
    const isAllowed = allowedFounderPaths.some(path => url.pathname.startsWith(path));

    if (!isAllowed) {
      if (url.pathname === '/login' || url.pathname === '/' || url.pathname === '/register' || url.pathname === '/setup-wizard') {
        url.pathname = '/founder/login';
        return NextResponse.redirect(url);
      }
      url.pathname = '/founder';
      return NextResponse.redirect(url);
    }
  } 
  // 2. Enforce Registration subdomain boundaries
  else if (subdomain === 'register') {
    const isAllowed = url.pathname.startsWith('/register') || url.pathname.startsWith('/api') || url.pathname.startsWith('/_next') || url.pathname.startsWith('/static');
    if (!isAllowed) {
      url.pathname = '/register';
      return NextResponse.redirect(url);
    }
  } 
  // 3. Enforce Activation subdomain boundaries
  else if (subdomain === 'activate') {
    const isAllowed = url.pathname.startsWith('/activate') || url.pathname.startsWith('/api') || url.pathname.startsWith('/_next') || url.pathname.startsWith('/static');
    if (!isAllowed) {
      url.pathname = '/activate';
      return NextResponse.redirect(url);
    }
  } 
  // 4. Enforce Support subdomain boundaries
  else if (subdomain === 'support') {
    const isAllowed = url.pathname.startsWith('/support') || url.pathname.startsWith('/api') || url.pathname.startsWith('/_next') || url.pathname.startsWith('/static');
    if (!isAllowed) {
      url.pathname = '/support';
      return NextResponse.redirect(url);
    }
  } 
  // 5. Root domain or empty/www (Platform Directory)
  else if (!subdomain || subdomain === 'www' || subdomain === 'aurxon-erp-lite') {
    if (url.pathname.startsWith('/register')) {
      return NextResponse.redirect(new URL(getSubdomainUrl('register', '/register', request)));
    }
    if (url.pathname.startsWith('/activate')) {
      return NextResponse.redirect(new URL(getSubdomainUrl('activate', '/activate', request)));
    }
    if (url.pathname.startsWith('/support')) {
      return NextResponse.redirect(new URL(getSubdomainUrl('support', '/support', request)));
    }
    if (url.pathname.startsWith('/founder') || url.pathname.startsWith('/founder-console')) {
      return NextResponse.redirect(new URL(getSubdomainUrl('portal', '/founder/login', request)));
    }
    if (url.pathname.startsWith('/login') || url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/student') || url.pathname.startsWith('/parent')) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  } 
  // 6. Customer Workspaces (tenant-slug)
  else {
    if (url.pathname.startsWith('/founder') || url.pathname.startsWith('/founder-console') || url.pathname.startsWith('/register') || url.pathname.startsWith('/activate') || url.pathname.startsWith('/support')) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-slug', subdomain);

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
    '/((?!api|_next|static|.*\\..*$).*)',
  ],
};
