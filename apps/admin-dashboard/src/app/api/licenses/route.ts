import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const tier = searchParams.get('tier') || 'all';
    
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('licenses')
      .select(`
        *,
        users:user_id (id, email, full_name)
      `, { count: 'exact' });

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('is_active', status === 'active');
    }

    // Apply tier filter
    if (tier !== 'all') {
      query = query.eq('tier', tier);
    }

    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: licenses, count, error } = await query;

    if (error) throw error;

    // Format licenses
    const formattedLicenses = (licenses || []).map((license) => {
      const expiresAt = license.expires_at ? new Date(license.expires_at) : null;
      const now = new Date();
      const isExpired = expiresAt && expiresAt < now;
      
      let daysRemaining: number | null = null;
      if (expiresAt) {
        daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }

      return {
        id: license.id,
        licenseKey: license.license_key || '****-****-****',
        tier: license.tier,
        isActive: license.is_active && !isExpired,
        isExpired,
        expiresAt: license.expires_at,
        daysRemaining,
        maxMachines: license.max_machines,
        activatedMachines: license.activated_machines || 0,
        user: license.users ? {
          id: license.users.id,
          email: license.users.email,
          name: license.users.full_name || license.users.email?.split('@')[0],
        } : null,
        createdAt: license.created_at,
        updatedAt: license.updated_at,
      };
    });

    // Apply search filter (done in-memory since it spans user data)
    let filteredLicenses = formattedLicenses;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLicenses = formattedLicenses.filter(l => 
        l.licenseKey?.toLowerCase().includes(searchLower) ||
        l.user?.email?.toLowerCase().includes(searchLower) ||
        l.user?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Get stats
    const { data: allLicenses } = await supabaseAdmin
      .from('licenses')
      .select('tier, is_active, expires_at');

    const stats = {
      total: allLicenses?.length || 0,
      active: allLicenses?.filter(l => l.is_active && (!l.expires_at || new Date(l.expires_at) > new Date())).length || 0,
      expired: allLicenses?.filter(l => l.expires_at && new Date(l.expires_at) < new Date()).length || 0,
      byTier: {
        free: allLicenses?.filter(l => l.tier === 'free').length || 0,
        starter: allLicenses?.filter(l => l.tier === 'starter').length || 0,
        pro: allLicenses?.filter(l => l.tier === 'pro').length || 0,
        enterprise: allLicenses?.filter(l => l.tier === 'enterprise').length || 0,
      }
    };

    return NextResponse.json({
      licenses: filteredLicenses,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      stats,
    });
  } catch (error) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch licenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, tier, expiresInDays, maxMachines } = body;

    if (!userId || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, tier' },
        { status: 400 }
      );
    }

    // Generate license key
    const jwt = require('jsonwebtoken');
    const crypto = require('crypto');
    const jwtSecret = process.env.LICENSE_JWT_SECRET || 'dev-secret';
    
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default 1 year

    const licenseKey = jwt.sign(
      {
        userId,
        tier,
        exp: Math.floor(expiresAt.getTime() / 1000),
        iat: Math.floor(Date.now() / 1000),
      },
      jwtSecret
    );

    const keyHash = crypto.createHash('sha256').update(licenseKey).digest('hex');
    const keyPreview = `${licenseKey.slice(0, 8)}...${licenseKey.slice(-4)}`;

    const { data: license, error } = await supabaseAdmin
      .from('licenses')
      .insert({
        user_id: userId,
        license_key: keyPreview,
        key_hash: keyHash,
        tier,
        is_active: true,
        max_machines: maxMachines || (tier === 'enterprise' ? -1 : tier === 'team' ? 5 : 2),
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      license: {
        ...license,
        fullKey: licenseKey, // Only returned once on creation
      },
    });
  } catch (error) {
    console.error('Error creating license:', error);
    return NextResponse.json(
      { error: 'Failed to create license' },
      { status: 500 }
    );
  }
}
