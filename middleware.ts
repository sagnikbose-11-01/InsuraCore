// ============================================================
// middleware.ts
// Next.js Edge Middleware — runs on every request before
// rendering. Handles RBAC route protection and redirects.
//
// Strategy:
// 1. Extract JWT from HttpOnly cookie
// 2. Verify signature using Web Crypto API (Edge compatible)
// 3. Match path against role requirements
// 4. Redirect unauthorized users appropriately
//
// NOTE: jsonwebtoken uses Node.js crypto — it cannot run in the
// Edge runtime. We use verifyTokenEdge (Web Crypto API) instead.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenEdge } from '@/lib/auth/jwt-edge';
import { COOKIE_NAME } from '@/lib/auth/session';
import { UserRole } from '@/lib/constants/enums';

// Route prefix → required roles mapping
const PROTECTED_ROUTES: { prefix: string; roles: UserRole[] }[] = [
  { prefix: '/dashboard', roles: [UserRole.CUSTOMER] },
  { prefix: '/assessor', roles: [UserRole.ASSESSOR] },
  { prefix: '/admin', roles: [UserRole.ADMIN] },
];

// Public routes that should redirect authenticated users away
const AUTH_ROUTES = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  const jwtSecret = process.env.JWT_SECRET ?? '';
  const session = token ? await verifyTokenEdge(token, jwtSecret) : null;

  // Transparent redirects for legacy auth paths
  if (pathname === '/login') {
    const loginUrl = new URL('/auth/login', request.url);
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
    if (callbackUrl) {
      loginUrl.searchParams.set('callbackUrl', callbackUrl);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/register') {
    return NextResponse.redirect(new URL('/auth/signup', request.url));
  }

  // Redirect authenticated users away from auth pages
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (session) {
      const redirectUrl = getRoleRedirect(session.role);
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // Check if this route requires protection
  const matchedRoute = PROTECTED_ROUTES.find((r) => pathname.startsWith(r.prefix));

  if (matchedRoute) {
    // Not logged in → redirect to login
    if (!session) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Wrong role → redirect to their correct dashboard
    if (!matchedRoute.roles.includes(session.role)) {
      return NextResponse.redirect(new URL(getRoleRedirect(session.role), request.url));
    }
  }

  return NextResponse.next();
}

function getRoleRedirect(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return '/admin';
    case UserRole.ASSESSOR:
      return '/assessor';
    case UserRole.CUSTOMER:
    default:
      return '/dashboard';
  }
}

export const config = {
  // Run middleware on protected routes and auth pages only
  matcher: ['/dashboard/:path*', '/assessor/:path*', '/admin/:path*', '/login', '/register', '/auth/:path*'],
};
