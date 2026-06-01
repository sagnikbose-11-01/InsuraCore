// ============================================================
// lib/auth/session.ts
// Server-side helper: reads the current user from the JWT cookie.
// Use this inside Server Components, Server Actions, or API routes.
// ============================================================

import { cookies } from 'next/headers';
import { verifyToken, JWTPayload } from './jwt';

export const COOKIE_NAME = 'insuracore_session';

// Read and validate session from cookie — safe for server use
export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  return verifyToken(token);
}

// Cookie options for consistent secure usage
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};
