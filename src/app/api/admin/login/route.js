import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

// Simple in-memory rate-limiter for IP requests
// In production, you would connect to Redis or Memcached
const rateLimitMap = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip) {
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const attempts = rateLimitMap.get(ip).filter(timestamp => now - timestamp < WINDOW_MS);
  attempts.push(now);
  rateLimitMap.set(ip, attempts);

  return attempts.length <= MAX_ATTEMPTS;
}

export async function POST(request) {
  // Get IP address from headers (standard Vercel/reverse-proxy headers)
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  // 1. Rate Limiting Check
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again in 15 minutes.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { password } = body;

    const expectedPassword = process.env.ADMIN_PASSWORD || 'default_admin_password_fallback_change_this';

    // 2. Validate Password
    if (password !== expectedPassword) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }

    // 3. Generate JWT Token
    const token = await signToken();

    // 4. Return Success Response with HTTP-only Cookie
    const response = NextResponse.json({ success: true });
    
    // Cookie expires in 7 days
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
