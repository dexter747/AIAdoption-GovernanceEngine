import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // Get total downloads
    const { count: totalDownloads, error: downloadsError } = await supabase
      .from('downloads')
      .select('*', { count: 'exact', head: true });

    // Get total revenue (completed payments)
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed');

    const totalRevenue = paymentsData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // Get active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: activeUsers, error: activeError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', thirtyDaysAgo.toISOString());

    // Calculate growth (compare to previous period)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Previous period users
    const { count: prevUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', thirtyDaysAgo.toISOString());

    // Current period new users
    const { count: newUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    const userGrowth = prevUsers && prevUsers > 0 
      ? ((newUsers || 0) / prevUsers) * 100 
      : (newUsers || 0) > 0 ? 100 : 0;

    // Previous period downloads
    const { count: prevDownloads } = await supabase
      .from('downloads')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', thirtyDaysAgo.toISOString())
      .gte('created_at', sixtyDaysAgo.toISOString());

    // Current period downloads
    const { count: currentDownloads } = await supabase
      .from('downloads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    const downloadGrowth = prevDownloads && prevDownloads > 0 
      ? (((currentDownloads || 0) - prevDownloads) / prevDownloads) * 100 
      : (currentDownloads || 0) > 0 ? 100 : 0;

    // Previous period revenue
    const { data: prevPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .lt('created_at', thirtyDaysAgo.toISOString())
      .gte('created_at', sixtyDaysAgo.toISOString());

    const prevRevenue = prevPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // Current period revenue
    const { data: currentPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const currentRevenue = currentPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    const revenueGrowth = prevRevenue > 0 
      ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 
      : currentRevenue > 0 ? 100 : 0;

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalDownloads: totalDownloads || 0,
      totalRevenue,
      activeUsers: activeUsers || 0,
      userGrowth: Math.round(userGrowth * 10) / 10,
      downloadGrowth: Math.round(downloadGrowth * 10) / 10,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      activeUserGrowth: 0, // Would need more complex calculation
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
