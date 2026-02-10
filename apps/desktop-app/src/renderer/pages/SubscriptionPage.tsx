import { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, Calendar, Check, X, Loader2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { cn, formatCurrency, formatDate } from '../lib/utils';
import { motion } from 'framer-motion';

interface Subscription {
  id: string;
  plan: 'trial' | 'professional' | 'team' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled' | 'unpaid';
  billingCycle: 'monthly' | 'yearly';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  amount: number;
  currency: string;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  createdAt: Date;
  invoiceUrl?: string;
}

const PLAN_DETAILS = {
  trial: {
    name: 'Trial',
    features: ['14 days', '100 queries', 'Basic support'],
    color: 'text-gray-500',
    bg: 'bg-gray-100',
  },
  professional: {
    name: 'Professional',
    features: ['Unlimited queries', 'All AI models', 'Priority support', '5 databases'],
    color: 'text-blue-500',
    bg: 'bg-blue-100',
  },
  team: {
    name: 'Team',
    features: ['Everything in Pro', '10 team members', 'Advanced analytics', 'Unlimited databases'],
    color: 'text-purple-500',
    bg: 'bg-purple-100',
  },
  enterprise: {
    name: 'Enterprise',
    features: ['Everything in Team', 'Unlimited users', 'Dedicated support', 'SLA', 'Custom integrations'],
    color: 'text-gold-500',
    bg: 'bg-gold-100',
  },
};

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  useEffect(() => {
    loadSubscription();
    loadPayments();
  }, []);

  const loadSubscription = async () => {
    try {
      setIsLoading(true);
      // Use api namespace - these are optional subscription features
      const sub = await window.electron.api?.getSubscription?.();
      if (sub) {
        // Ensure amount has a default value to prevent NaN
        setSubscription({
          ...sub,
          amount: sub.amount ?? 0,
          currency: sub.currency ?? 'USD',
        });
      } else {
        // Default trial subscription for logged in users without subscription data
        setSubscription({
          id: 'trial',
          plan: 'trial',
          status: 'active',
          billingCycle: 'monthly',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
          amount: 0,
          currency: 'USD',
        });
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
      // Default to trial on error
      setSubscription({
        id: 'trial',
        plan: 'trial',
        status: 'active',
        billingCycle: 'monthly',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        amount: 0,
        currency: 'USD',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      const pymts = await window.electron.api?.getPaymentHistory?.();
      setPayments(pymts || []);
    } catch (error) {
      console.error('Failed to load payments:', error);
      // Non-critical error
    }
  };

  const handleUpgrade = async (plan: string) => {
    try {
      setIsUpgrading(true);
      const result = await window.electron.api?.createCheckout?.({ plan });
      if (result?.checkoutUrl) {
        window.electron.system?.openExternal?.(result.checkoutUrl);
      }
    } catch (error) {
      console.error('Failed to upgrade:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You\'ll have access until the end of your billing period.')) {
      return;
    }

    try {
      setIsCanceling(true);
      await window.electron.api?.cancelSubscription?.();
      await loadSubscription();
    } catch (error) {
      console.error('Failed to cancel:', error);
    } finally {
      setIsCanceling(false);
    }
  };

  const handleReactivate = async () => {
    try {
      await window.electron.api?.reactivateSubscription?.();
      await loadSubscription();
    } catch (error) {
      console.error('Failed to reactivate:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const planDetails = subscription ? PLAN_DETAILS[subscription.plan] : null;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Subscription & Billing</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription, view invoices, and upgrade your plan
        </p>
      </div>

      {/* Current Plan */}
      {subscription && planDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{planDetails.name} Plan</CardTitle>
                  <CardDescription className="mt-2">
                    {subscription.status === 'active' ? (
                      <span className="flex items-center gap-2 text-green-600">
                        <Check className="w-4 h-4" />
                        Active subscription
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-red-600">
                        <X className="w-4 h-4" />
                        {subscription.status}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className={cn('px-4 py-2 rounded-lg', planDetails.bg)}>
                  <p className={cn('text-2xl font-bold', planDetails.color)}>
                    {subscription.plan === 'trial' ? 'Free' : formatCurrency((subscription.amount ?? 0) / 100)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {subscription.plan === 'trial' ? '14 day trial' : `per ${subscription.billingCycle === 'monthly' ? 'month' : 'year'}`}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Features */}
              <div>
                <h3 className="font-semibold mb-3">Plan Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  {planDetails.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Period */}
              <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Current billing period</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  </div>
                </div>
                {subscription.cancelAtPeriodEnd && (
                  <div className="text-orange-600 text-sm font-medium">
                    Cancels on {formatDate(subscription.currentPeriodEnd)}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {subscription.plan !== 'enterprise' && (
                  <Button onClick={() => handleUpgrade('professional')} disabled={isUpgrading}>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                )}
                {subscription.cancelAtPeriodEnd ? (
                  <Button variant="outline" onClick={handleReactivate}>
                    Reactivate Subscription
                  </Button>
                ) : (
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelSubscription}
                    disabled={isCanceling}
                  >
                    {isCanceling ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <X className="w-4 h-4 mr-2" />
                    )}
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* No Subscription */}
      {!subscription && (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>Choose a plan to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleUpgrade('professional')}>
              View Plans
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View all your past transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      payment.status === 'succeeded' ? 'bg-green-100 text-green-600' :
                      payment.status === 'failed' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-600'
                    )}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {formatCurrency(payment.amount / 100, payment.currency.toUpperCase())}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(payment.createdAt)} • {payment.status}
                      </p>
                    </div>
                  </div>
                  {payment.invoiceUrl && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.electron.system?.openExternal?.(payment.invoiceUrl!)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Invoice
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No payment history yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Usage Stats (if available) */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
          <CardDescription>Track your API usage and costs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold text-primary">1,234</p>
              <p className="text-sm text-muted-foreground mt-1">Queries</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold text-purple-600">45.2K</p>
              <p className="text-sm text-muted-foreground mt-1">Tokens</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-3xl font-bold text-green-600">$12.45</p>
              <p className="text-sm text-muted-foreground mt-1">Cost</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
