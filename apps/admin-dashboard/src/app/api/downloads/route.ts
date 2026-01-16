import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const platform = searchParams.get('platform') || 'all';
    const version = searchParams.get('version') || 'all';
    
    const offset = (page - 1) * limit;

    // First get downloads
    let query = supabase
      .from('downloads')
      .select('*, users!inner(email, full_name)', { count: 'exact' });

    // Apply platform filter
    if (platform !== 'all') {
      query = query.eq('platform', platform.toLowerCase());
    }

    // Apply version filter
    if (version !== 'all') {
      query = query.eq('version', version);
    }

    // Apply search filter (by user email or name)
    if (search) {
      query = query.or(`users.email.ilike.%${search}%,users.full_name.ilike.%${search}%`);
    }

    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: downloads, count, error } = await query;

    if (error) throw error;

    // Get unique versions for filter dropdown
    const { data: versionsData } = await supabase
      .from('downloads')
      .select('version')
      .order('version', { ascending: false });

    const versions = [...new Set(versionsData?.map(d => d.version) || [])];

    // Format downloads
    const formattedDownloads = (downloads || []).map((download: any) => {
      const downloadDate = new Date(download.created_at);
      const now = new Date();
      const diffMs = now.getTime() - downloadDate.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      let dateStr = '';
      if (diffHours < 1) dateStr = 'Just now';
      else if (diffHours < 24) dateStr = `${diffHours} hours ago`;
      else if (diffDays < 7) dateStr = `${diffDays} days ago`;
      else dateStr = downloadDate.toLocaleDateString();

      return {
        id: download.id,
        user: download.users?.full_name || download.users?.email?.split('@')[0] || 'Unknown',
        email: download.users?.email || '',
        version: download.version,
        platform: download.platform.charAt(0).toUpperCase() + download.platform.slice(1),
        date: dateStr,
        fullDate: download.created_at,
      };
    });

    // Get platform counts
    const { data: platformCounts } = await supabase
      .from('downloads')
      .select('platform');

    const platforms = {
      windows: platformCounts?.filter(d => d.platform === 'windows').length || 0,
      macos: platformCounts?.filter(d => d.platform === 'macos').length || 0,
      linux: platformCounts?.filter(d => d.platform === 'linux').length || 0,
    };

    return NextResponse.json({
      downloads: formattedDownloads,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      versions,
      platforms,
    });
  } catch (error) {
    console.error('Error fetching downloads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch downloads' },
      { status: 500 }
    );
  }
}
