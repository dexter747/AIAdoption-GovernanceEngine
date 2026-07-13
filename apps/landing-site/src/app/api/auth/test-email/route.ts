/**
 * Test Email API — Development only
 * POST /api/auth/test-email
 * Sends a test email to verify SMTP configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/services/email';

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { to } = body;

    if (!to) {
      return NextResponse.json({ error: 'Recipient email (to) is required' }, { status: 400 });
    }

    const result = await sendWelcomeEmail(to, 'Test User');

    if (result.success) {
      return NextResponse.json({ message: `Test email sent to ${to}`, data: result.data });
    } else {
      return NextResponse.json(
        { error: 'Failed to send', details: String(result.error) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
