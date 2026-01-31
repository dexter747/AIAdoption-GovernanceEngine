import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt-auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const result = await verifyToken(token);
  
  if (!result.success || !result.user) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: result.user.sub,
      email: result.user.email,
      name: result.user.name,
      image: result.user.image,
      role: result.user.role,
    },
  });
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  
  response.cookies.set('refresh-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
