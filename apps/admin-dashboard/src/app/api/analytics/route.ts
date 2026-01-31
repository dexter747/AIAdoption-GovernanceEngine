import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Get daily user signups for the last 30 days
    const { data: usersData } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Get daily revenue for the last 30 days
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('amount, created_at')
      .eq('status', 'completed')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Get daily downloads for the last 30 days
    const { data: downloadsData } = await supabase
      .from('downloads')
      .select('created_at, platform')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Get plan distribution
    const { data: plansData } = await supabase
      .from('users')
      .select('plan');

    // Process into daily data
    const dailyUsers: Record<string, number> = {};
    const dailyRevenue: Record<string, number> = {};
    const dailyDownloads: Record<string, number> = {};
    const platformCounts: Record<string, number> = { windows: 0, macos: 0, linux: 0 };
    const planCounts: Record<string, number> = { free: 0, professional: 0, enterprise: 0 };

    // Initialize all days with 0
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyUsers[dateStr] = 0;
      dailyRevenue[dateStr] = 0;
      dailyDownloads[dateStr] = 0;
    }

    // Aggregate users by day
    usersData?.forEach(user => {
      const dateStr = new Date(user.created_at).toISOString().split('T')[0];
      if (dailyUsers[dateStr] !== undefined) {
        dailyUsers[dateStr]++;
      }
    });

    // Aggregate revenue by day
    paymentsData?.forEach(payment => {
      const dateStr = new Date(payment.created_at).toISOString().split('T')[0];
      if (dailyRevenue[dateStr] !== undefined) {
        dailyRevenue[dateStr] += Number(payment.amount);
      }
    });

    // Aggregate downloads by day and platform
    downloadsData?.forEach(download => {
      const dateStr = new Date(download.created_at).toISOString().split('T')[0];
      if (dailyDownloads[dateStr] !== undefined) {
        dailyDownloads[dateStr]++;
      }
      const platform = download.platform?.toLowerCase() || 'other';
      if (platformCounts[platform] !== undefined) {
        platformCounts[platform]++;
      }
    });

    // Aggregate plans
    plansData?.forEach(user => {
      const plan = user.plan || 'free';
      if (planCounts[plan] !== undefined) {
        planCounts[plan]++;
      }
    });

    // Convert to chart data
    const userChartData = Object.entries(dailyUsers).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      users: count,
    }));

    const revenueChartData = Object.entries(dailyRevenue).map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: amount / 100, // Convert cents to dollars
    }));

    const downloadChartData = Object.entries(dailyDownloads).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      downloads: count,
    }));

    const platformChartData = Object.entries(platformCounts).map(([platform, count]) => ({
      name: platform.charAt(0).toUpperCase() + platform.slice(1),
      value: count,
    }));

    const planChartData = Object.entries(planCounts).map(([plan, count]) => ({
      name: plan === 'professional' ? 'Pro' : plan.charAt(0).toUpperCase() + plan.slice(1),
      value: count,
    }));

    return NextResponse.json({
      userChartData,
      revenueChartData,
      downloadChartData,
      platformChartData,
      planChartData,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
