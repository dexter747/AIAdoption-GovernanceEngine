export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/api-auth';

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get daily user signups for the last 30 days
    const { data: usersData } = await supabaseAdmin
      .from('users')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Get daily revenue for the last 30 days
    const { data: paymentsData } = await supabaseAdmin
      .from('payments')
      .select('amount, created_at')
      .eq('status', 'completed')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Get license activations for the last 30 days (replaces downloads)
    const { data: activationsData } = await supabaseAdmin
      .from('license_activations')
      .select('activated_at, platform')
      .gte('activated_at', thirtyDaysAgo.toISOString())
      .order('activated_at', { ascending: true });

    // Get plan distribution from subscriptions
    const { data: plansData } = await supabaseAdmin.from('subscriptions').select('plan');

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

    // Aggregate activations by day and platform
    activationsData?.forEach(activation => {
      const dateStr = new Date(activation.activated_at).toISOString().split('T')[0];
      if (dailyDownloads[dateStr] !== undefined) {
        dailyDownloads[dateStr]++;
      }
      const platform = activation.platform?.toLowerCase() || 'other';
      if (platformCounts[platform] !== undefined) {
        platformCounts[platform]++;
      }
    });

    // Aggregate plans from subscriptions
    plansData?.forEach(sub => {
      const plan = sub.plan || 'free';
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
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
