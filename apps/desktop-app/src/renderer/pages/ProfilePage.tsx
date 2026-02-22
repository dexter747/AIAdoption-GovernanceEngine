import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Mail, User, CreditCard, Calendar, Shield, ExternalLink, Loader2 } from 'lucide-react';

interface SubscriptionData {
  plan: string;
  status: string;
  billingPeriod?: { start?: string; end?: string };
}

const PLAN_LABELS: Record<string, { name: string; price: string }> = {
  trial: { name: 'Free Trial', price: 'Free' },
  professional: { name: 'Professional', price: '$49/month' },
  team: { name: 'Team', price: '$199/month' },
  enterprise: { name: 'Enterprise', price: 'Custom' },
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [subResult, profileResult] = await Promise.allSettled([
          (window.electron as any).api?.getSubscription?.(),
          (window.electron as any).api?.getUserProfile?.(),
        ]);
        if (subResult.status === 'fulfilled' && subResult.value) {
          setSubscription(subResult.value);
        }
        if (profileResult.status === 'fulfilled' && profileResult.value) {
          setProfile(profileResult.value);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const planInfo = PLAN_LABELS[subscription?.plan || 'trial'] || PLAN_LABELS.trial;
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : user?.email
      ? 'Active'
      : '—';
  const nextBilling = subscription?.billingPeriod?.end
    ? new Date(subscription.billingPeriod.end).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-medium text-white">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl p-6 mb-6 bg-black border-zinc-800">
        <div className="flex items-center gap-6">
          {user?.image ? (
            <img src={user.image} alt={user.name} className="w-20 h-20 rounded-full" />
          ) : (
            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-medium">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          <div>
            <h2 className="font-medium text-white">{user?.name || 'User'}</h2>
            <p className="text-muted-foreground">{user?.email || ''}</p>
            <div className="flex items-center gap-2 mt-2">
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
              ) : (
                <span className="px-2 py-1 font-medium rounded-full bg-zinc-900/40 text-zinc-400">
                  {planInfo.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl p-6 bg-black border-zinc-800">
          <h3 className="font-medium mb-4 text-white">Account Details</h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-white">{user?.name || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-white">{user?.email || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-white">{memberSince}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 bg-black border-zinc-800">
          <h3 className="font-medium mb-4 text-white">Subscription</h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Current Plan</p>
                <p className="text-white">
                  {loading ? '…' : `${planInfo.name} — ${planInfo.price}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Next Billing Date</p>
                <p className="text-white">{loading ? '…' : nextBilling}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/subscription')}
              className="flex items-center gap-2 text-sm text-zinc-300 hover:text-zinc-400"
            >
              <ExternalLink className="w-4 h-4" />
              Manage subscription
            </button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="mt-6 rounded-xl p-6 bg-black border-zinc-800">
        <h3 className="font-medium mb-4 text-white">Security</h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-zinc-400" />
            <div>
              <p className="font-medium text-white">Signed in with Google</p>
              <p className="text-xs text-muted-foreground">
                Your account is secured with Google authentication
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-300 rounded-lg transition-colors hover:bg-zinc-950"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
