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
    const status = searchParams.get('status') || 'all';
    const plan = searchParams.get('plan') || 'all';

    const offset = (page - 1) * limit;

    // Get payments with user info
    let query = supabaseAdmin
      .from('payments')
      .select('*, users!inner(email, full_name), subscriptions(plan)', { count: 'exact' });

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status.toLowerCase());
    }

    // Apply search filter
    if (search) {
      query = query.or(`users.email.ilike.%${search}%,users.full_name.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: payments, count, error } = await query;

    if (error) throw error;

    // Calculate totals
    const { data: allPayments } = await supabaseAdmin.from('payments').select('amount, status');

    const totalRevenue =
      allPayments
        ?.filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    const pendingAmount =
      allPayments
        ?.filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    const refundedAmount =
      allPayments
        ?.filter(p => p.status === 'refunded')
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // Format payments
    const formattedPayments = (payments || []).map((payment: any) => {
      const paymentDate = new Date(payment.created_at);
      const now = new Date();
      const diffMs = now.getTime() - paymentDate.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      let dateStr = '';
      if (diffHours < 1) dateStr = 'Just now';
      else if (diffHours < 24) dateStr = `${diffHours} hours ago`;
      else if (diffDays < 7) dateStr = `${diffDays} days ago`;
      else dateStr = paymentDate.toLocaleDateString();

      // Get plan from subscription or infer from amount
      let plan = payment.subscriptions?.plan || 'Pro';
      if (Number(payment.amount) >= 99) plan = 'Enterprise';
      else if (Number(payment.amount) >= 29) plan = 'Pro';

      return {
        id: payment.id,
        user: payment.users?.full_name || payment.users?.email?.split('@')[0] || 'Unknown',
        email: payment.users?.email || '',
        amount: Number(payment.amount),
        currency: payment.currency,
        plan: plan.charAt(0).toUpperCase() + plan.slice(1),
        status: payment.status.charAt(0).toUpperCase() + payment.status.slice(1),
        method: payment.payment_method || payment.payment_provider,
        date: dateStr,
        fullDate: payment.created_at,
      };
    });

    return NextResponse.json({
      payments: formattedPayments,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      summary: {
        totalRevenue,
        totalTransactions: allPayments?.length || 0,
        pendingAmount,
        refundedAmount,
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
