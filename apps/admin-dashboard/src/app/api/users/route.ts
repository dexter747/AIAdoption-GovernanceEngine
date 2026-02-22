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
    const plan = searchParams.get('plan') || 'all';
    const status = searchParams.get('status') || 'all';
    
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    // Apply plan filter
    if (plan !== 'all') {
      query = query.eq('plan', plan);
    }

    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: users, count, error } = await query;

    if (error) throw error;

    // Get subscription status for each user
    const usersWithStatus = await Promise.all(
      (users || []).map(async (user) => {
        const { data: subscription } = await supabaseAdmin
          .from('subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Determine user status
        let userStatus = 'Active';
        if (subscription) {
          if (subscription.status === 'cancelled') userStatus = 'Inactive';
          else if (subscription.status === 'past_due') userStatus = 'Pending';
        }

        // Calculate relative time for joined
        const joinedDate = new Date(user.created_at);
        const now = new Date();
        const diffMs = now.getTime() - joinedDate.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        let joined = '';
        if (diffHours < 1) joined = 'Just now';
        else if (diffHours < 24) joined = `${diffHours} hours ago`;
        else if (diffDays < 30) joined = `${diffDays} days ago`;
        else joined = joinedDate.toLocaleDateString();

        return {
          id: user.id,
          name: user.full_name || user.email.split('@')[0],
          email: user.email,
          plan: user.plan === 'professional' ? 'Pro' : user.plan === 'enterprise' ? 'Enterprise' : 'Free',
          status: userStatus,
          joined,
          lastActive: user.updated_at,
          createdAt: user.created_at,
        };
      })
    );

    return NextResponse.json({
      users: usersWithStatus,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
