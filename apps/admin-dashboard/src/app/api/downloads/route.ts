export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const platform = searchParams.get('platform') || 'all';

    const offset = (page - 1) * limit;

    // Query license_activations joined to licenses then users
    let query = supabaseAdmin.from('license_activations').select(
      `id, device_name, platform, ip_address, activated_at, is_active,
         licenses!inner(license_key, tier, user_id,
           users:user_id(id, email, full_name)
         )`,
      { count: 'exact' }
    );

    // Apply platform filter
    if (platform !== 'all') {
      query = query.eq('platform', platform.toLowerCase());
    }

    // Apply pagination
    query = query.order('activated_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: activations, count, error } = await query;

    if (error) throw error;

    // Format activations
    const formattedDownloads = (activations || [])
      .map((a: any) => {
        const license = a.licenses;
        const user = license?.users;

        // Search filter (in-memory since cross-table)
        if (search) {
          const s = search.toLowerCase();
          const matchEmail = user?.email?.toLowerCase().includes(s);
          const matchName = user?.full_name?.toLowerCase().includes(s);
          const matchDevice = a.device_name?.toLowerCase().includes(s);
          if (!matchEmail && !matchName && !matchDevice) return null;
        }

        const activationDate = new Date(a.activated_at);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - activationDate.getTime()) / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        let dateStr = '';
        if (diffHours < 1) dateStr = 'Just now';
        else if (diffHours < 24) dateStr = `${diffHours}h ago`;
        else if (diffDays < 7) dateStr = `${diffDays}d ago`;
        else dateStr = activationDate.toLocaleDateString();

        return {
          id: a.id,
          user: user?.full_name || user?.email?.split('@')[0] || 'Unknown',
          email: user?.email || '',
          version: license?.tier || 'N/A',
          platform: a.platform
            ? a.platform.charAt(0).toUpperCase() + a.platform.slice(1)
            : 'Unknown',
          deviceName: a.device_name || 'Unknown Device',
          date: dateStr,
          fullDate: a.activated_at,
          isActive: a.is_active,
        };
      })
      .filter(Boolean);

    // Platform counts across all activations
    const { data: allActivations } = await supabaseAdmin
      .from('license_activations')
      .select('platform');

    const platforms = {
      windows: allActivations?.filter(a => a.platform === 'windows').length || 0,
      macos: allActivations?.filter(a => a.platform === 'macos').length || 0,
      linux: allActivations?.filter(a => a.platform === 'linux').length || 0,
    };

    return NextResponse.json({
      downloads: formattedDownloads,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      platforms,
    });
  } catch (error) {
    console.error('Error fetching activations:', error);
    return NextResponse.json({ error: 'Failed to fetch activations' }, { status: 500 });
  }
}
