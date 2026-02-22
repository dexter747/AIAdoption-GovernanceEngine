/**
 * Desktop Token API Route
 * Generates a proper JWT token for the desktop app to use with the Express API
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import jwt from 'jsonwebtoken';

// Use the same JWT secret as the Express API
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create a JWT token that the Express API can verify
    const token = jwt.sign(
      {
        id: session.user.id || session.user.email,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      },
      JWT_SECRET,
      {
        expiresIn: '7d',
        issuer: 'velanova',
        audience: 'desktop-app',
      }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: session.user.id || session.user.email,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      },
    });
  } catch (error) {
    console.error('Failed to generate desktop token:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
