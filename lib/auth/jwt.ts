// ============================================================
// lib/auth/jwt.ts
// JWT utility — sign, verify, and decode tokens.
// Tokens are stored in secure HttpOnly cookies (see auth actions).
// ============================================================

import jwt from 'jsonwebtoken';
import { UserRole, PolicyType } from '@/lib/constants/enums';

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  specialization?: PolicyType;
}

// Sign a JWT with 7-day expiry
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify and decode a JWT — returns null if invalid/expired
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Decode without verification (use only for reading non-sensitive payload)
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}
