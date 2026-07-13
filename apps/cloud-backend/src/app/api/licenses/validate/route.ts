import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyLicenseKey } from '@/lib/license';

export async function POST(request: Request) {
  try {
    const { license_key } = await request.json();

    if (!license_key) {
      return NextResponse.json({ error: 'License key required' }, { status: 400 });
    }

    // Verify JWT signature and decode
    const decoded = await verifyLicenseKey(license_key);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid license key' }, { status: 401 });
    }

    // Check license in database
    const license = await prisma.license.findUnique({
      where: { license_key },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        subscription: true,
      },
    });

    if (!license) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }

    // Check if license is active
    if (license.status !== 'active') {
      return NextResponse.json(
        { error: 'License is not active', status: license.status },
        { status: 403 }
      );
    }

    // Check expiration
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return NextResponse.json({ error: 'License expired' }, { status: 403 });
    }

    // Update last validated timestamp
    await prisma.license.update({
      where: { id: license.id },
      data: { last_validated_at: new Date() },
    });

    return NextResponse.json({
      valid: true,
      license: {
        id: license.id,
        plan_type: license.plan_type,
        status: license.status,
        max_devices: license.max_devices,
        expires_at: license.expires_at,
        user: license.user,
      },
    });
  } catch (error) {
    console.error('License validation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
