import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Download, RefreshCw, CheckCircle, XCircle, AlertCircle, Search, Filter, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { cn, formatCurrency, formatDate } from '../lib/utils';

interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  plan: string;
  paymentMethod: string;
  createdAt: Date;
  invoiceUrl?: string;
}

interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: 'trial' | 'professional' | 'team' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  mrr: number;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'payments' | 'subscriptions'>('payments');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API calls
      const mockPayments: Payment[] = [
        {
          id: 'pay_1',
          userId: 'user_1',
          userName: 'John Doe',
          userEmail: 'john@company.com',
          amount: 49,
          currency: 'USD',
          status: 'succeeded',
          plan: 'Professional',
          paymentMethod: 'card_visa',
          createdAt: new Date(),
          invoiceUrl: 'https://invoice.example.com/1',
        },
        {
          id: 'pay_2',
          userId: 'user_2',
          userName: 'Jane Smith',
          userEmail: 'jane@startup.io',
          amount: 199,
          currency: 'USD',
          status: 'succeeded',
          plan: 'Team',
          paymentMethod: 'card_mastercard',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          invoiceUrl: 'https://invoice.example.com/2',
        },
        {
          id: 'pay_3',
          userId: 'user_3',
          userName: 'Bob Wilson',
          userEmail: 'bob@tech.com',
          amount: 49,
          currency: 'USD',
          status: 'failed',
          plan: 'Professional',
          paymentMethod: 'card_visa',
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        },
      ];

      const mockSubscriptions: Subscription[] = [
        {
          id: 'sub_1',
          userId: 'user_1',
          userName: 'John Doe',
          userEmail: 'john@company.com',
          plan: 'professional',
          status: 'active',
          currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
          mrr: 49,
        },
        {
          id: 'sub_2',
          userId: 'user_2',
          userName: 'Jane Smith',
          userEmail: 'jane@startup.io',
          plan: 'team',
          status: 'active',
          currentPeriodStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          currentPeriodEnd: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
          mrr: 199,
        },
        {
          id: 'sub_3',
          userId: 'user_3',
          userName: 'Alice Johnson',
          userEmail: 'alice@business.com',
          plan: 'professional',
          status: 'past_due',
          currentPeriodStart: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
          currentPeriodEnd: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
          mrr: 49,
        },
      ];

      setPayments(mockPayments);
      setSubscriptions(mockSubscriptions);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refundPayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to refund this payment?')) return;
    try {
      // TODO: API call
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'refunded' } : p));
    } catch (error) {
      console.error('Failed to refund payment:', error);
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Cancel this subscription at period end?')) return;
    try {
      // TODO: API call
      setSubscriptions(prev => prev.map(s => s.id === subscriptionId ? { ...s, cancelAtPeriodEnd: true } : s));
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      succeeded: 'success',
      active: 'success',
      trialing: 'default',
      pending: 'warning',
      past_due: 'warning',
      failed: 'destructive',
      refunded: 'secondary',
      canceled: 'secondary',
    };
    return variants[status] || 'secondary';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'succeeded' || status === 'active') return CheckCircle;
    if (status === 'failed' || status === 'canceled') return XCircle;
    return AlertCircle;
  };

  const stats = {
    totalRevenue: payments.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + p.amount, 0),
    mrr: subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.mrr, 0),
    activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
    pastDue: subscriptions.filter(s => s.status === 'past_due').length,
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredSubscriptions = subscriptions.filter(s => {
    const matchesSearch = s.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments & Subscriptions</h1>
          <p className="text-muted-foreground mt-2">
            Manage payments, subscriptions, and billing
          </p>
        </div>
        <Button onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">MRR</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{formatCurrency(stats.mrr)}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                <p className="text-2xl font-bold mt-1">{stats.activeSubscriptions}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Past Due</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.pastDue}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('payments')}
            className={cn(
              'pb-3 border-b-2 transition-colors font-medium',
              activeTab === 'payments'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={cn(
              'pb-3 border-b-2 transition-colors font-medium',
              activeTab === 'subscriptions'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Subscriptions
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-md bg-background"
        >
          <option value="all">All Status</option>
          {activeTab === 'payments' ? (
            <>
              <option value="succeeded">Succeeded</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </>
          ) : (
            <>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="past_due">Past Due</option>
              <option value="canceled">Canceled</option>
            </>
          )}
        </select>
      </div>

      {/* Content */}
      {activeTab === 'payments' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="p-4 text-left text-sm font-medium">User</th>
                    <th className="p-4 text-left text-sm font-medium">Amount</th>
                    <th className="p-4 text-left text-sm font-medium">Plan</th>
                    <th className="p-4 text-left text-sm font-medium">Status</th>
                    <th className="p-4 text-left text-sm font-medium">Payment Method</th>
                    <th className="p-4 text-left text-sm font-medium">Date</th>
                    <th className="p-4 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPayments.map((payment) => {
                    const StatusIcon = getStatusIcon(payment.status);
                    return (
                      <tr key={payment.id} className="hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{payment.userName}</p>
                            <p className="text-sm text-muted-foreground">{payment.userEmail}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">{payment.plan}</span>
                        </td>
                        <td className="p-4">
                          <Badge variant={getStatusBadge(payment.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-sm capitalize">{payment.paymentMethod.replace('card_', '')}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground">{formatDate(payment.createdAt)}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {payment.invoiceUrl && (
                              <Button variant="ghost" size="sm" onClick={() => window.open(payment.invoiceUrl, '_blank')}>
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                            {payment.status === 'succeeded' && (
                              <Button variant="ghost" size="sm" onClick={() => refundPayment(payment.id)}>
                                Refund
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="p-4 text-left text-sm font-medium">User</th>
                    <th className="p-4 text-left text-sm font-medium">Plan</th>
                    <th className="p-4 text-left text-sm font-medium">Status</th>
                    <th className="p-4 text-left text-sm font-medium">MRR</th>
                    <th className="p-4 text-left text-sm font-medium">Current Period</th>
                    <th className="p-4 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredSubscriptions.map((subscription) => {
                    const StatusIcon = getStatusIcon(subscription.status);
                    return (
                      <tr key={subscription.id} className="hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{subscription.userName}</p>
                            <p className="text-sm text-muted-foreground">{subscription.userEmail}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm capitalize font-medium">{subscription.plan}</span>
                        </td>
                        <td className="p-4">
                          <Badge variant={getStatusBadge(subscription.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {subscription.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold">{formatCurrency(subscription.mrr)}</span>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <p>{new Date(subscription.currentPeriodStart).toLocaleDateString()}</p>
                            <p className="text-muted-foreground">to {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                              <Button variant="ghost" size="sm" onClick={() => cancelSubscription(subscription.id)}>
                                Cancel
                              </Button>
                            )}
                            {subscription.cancelAtPeriodEnd && (
                              <span className="text-xs text-muted-foreground">Cancels at period end</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
