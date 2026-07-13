import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import {
  AlertTriangle, CheckCircle2, Info, XCircle, X,
  Bell, ShieldAlert, Banknote, ScanSearch, Scale,
} from 'lucide-react';
import { cn } from '../../lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   Real-time Alert Notification System
   Toast-style notifications for critical governance events across all modules.
   Designed for Electron desktop app — no external dependencies.
   ═══════════════════════════════════════════════════════════════════════════ */

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';

export interface AlertNotification {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  module: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  actionHref?: string;
}

interface NotificationContextType {
  notifications: AlertNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AlertNotification, 'id' | 'timestamp' | 'read'>) => void;
  dismissNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}

/* ── Severity-based styling ── */
const SEV_ICON: Record<AlertSeverity, React.ElementType> = {
  critical: XCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
};
const SEV_CLR: Record<AlertSeverity, string> = {
  critical: 'border-red-500/20 bg-red-900/10',
  warning: 'border-amber-500/20 bg-amber-900/10',
  info: 'border-blue-500/20 bg-blue-900/10',
  success: 'border-emerald-500/20 bg-emerald-900/10',
};
const SEV_ICON_CLR: Record<AlertSeverity, string> = {
  critical: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
  success: 'text-emerald-400',
};

const MODULE_ICON: Record<string, React.ElementType> = {
  'Fraud Detection': ShieldAlert,
  'AML': Banknote,
  'KYC': ScanSearch,
  'Regulatory': Scale,
};

/* ── Toast component (auto-dismiss) ── */
function Toast({ notification, onDismiss }: { notification: AlertNotification; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true));
    // Auto-dismiss after 6s (critical stays 10s)
    const duration = notification.severity === 'critical' ? 10000 : 6000;
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(notification.id), 300);
    }, duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [notification.id, notification.severity, onDismiss]);

  const SevIcon = SEV_ICON[notification.severity];

  return (
    <div className={cn(
      'w-[360px] rounded-xl border backdrop-blur-xl shadow-2xl shadow-black/40 p-3 transition-all duration-300',
      SEV_CLR[notification.severity],
      visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
    )}>
      <div className="flex items-start gap-2.5">
        <SevIcon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', SEV_ICON_CLR[notification.severity])} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[12px] font-medium text-white/80">{notification.title}</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-white/[0.04] text-zinc-500">{notification.module}</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">{notification.message}</p>
          {notification.actionLabel && (
            <button className="mt-1.5 text-[10px] text-indigo-400 hover:text-indigo-300 font-medium">{notification.actionLabel} →</button>
          )}
        </div>
        <button onClick={() => { setVisible(false); setTimeout(() => onDismiss(notification.id), 300); }}
          className="p-0.5 hover:bg-white/[0.06] rounded flex-shrink-0">
          <X className="w-3 h-3 text-zinc-600" />
        </button>
      </div>
    </div>
  );
}

/* ── Provider: wraps entire app, manages notification state ── */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [toasts, setToasts] = useState<AlertNotification[]>([]);

  const addNotification = useCallback((n: Omit<AlertNotification, 'id' | 'timestamp' | 'read'>) => {
    const notification: AlertNotification = {
      ...n,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50
    setToasts(prev => [notification, ...prev].slice(0, 5)); // Show max 5 toasts
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setToasts(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setToasts([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Simulate incoming alerts on mount (for demo purposes)
  useEffect(() => {
    const demoAlerts: Omit<AlertNotification, 'id' | 'timestamp' | 'read'>[] = [
      { severity: 'critical', title: 'SAR Filing Deadline', message: 'Heinrich Müller Trust SAR (SAR-2026-0042) — 72-hour JFSC filing deadline in 18 hours. MLRO review required.', module: 'AML', actionLabel: 'Open SAR', actionHref: '/aml' },
      { severity: 'critical', title: 'Sanctions Match Detected', message: 'Volkov International LLC attempted $1.2M wire to Cyprus. Transaction blocked. STR filed with JFSC.', module: 'AML', actionLabel: 'View Alert', actionHref: '/aml' },
      { severity: 'warning', title: 'Cash Structuring Pattern', message: '3 deposits below £10k threshold across Jersey branches within 72 hours. AI confidence: 94%.', module: 'Fraud Detection', actionLabel: 'Investigate', actionHref: '/fraud-detection' },
      { severity: 'warning', title: 'KYC Review Overdue', message: 'Channel Islands Property Trust periodic review is 12 days overdue. JFSC requires remediation within 30 days.', module: 'KYC', actionLabel: 'Start Review', actionHref: '/kyc' },
      { severity: 'info', title: 'Regulatory Change', message: 'JFSC AML/CFT Handbook Amendment 2026.02 effective April 2026 — trust EDD procedures require update.', module: 'Regulatory', actionLabel: 'View Details', actionHref: '/regulatory-intel' },
      { severity: 'success', title: 'STR Acknowledged', message: 'JFSC acknowledged Volkov International STR (ref: JFSC-ACK-2026-1847). Case in review.', module: 'AML' },
    ];

    const timers: ReturnType<typeof setTimeout>[] = [];
    demoAlerts.forEach((alert, i) => {
      timers.push(setTimeout(() => addNotification(alert), 1500 + i * 3000));
    });

    return () => timers.forEach(clearTimeout);
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, dismissNotification, markAsRead, markAllRead, clearAll }}>
      {children}
      {/* Toast container — fixed, top-right */}
      <div className="fixed top-3 right-3 z-[9999] flex flex-col gap-2">
        {toasts.map(t => (
          <Toast key={t.id} notification={t} onDismiss={dismissNotification} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

/* ── Notification Bell (for sidebar/toolbar) ── */
export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
        <Bell className="w-4 h-4 text-zinc-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[8px] text-white font-bold flex items-center justify-center animate-pulse">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-[380px] max-h-[480px] rounded-xl border border-white/[0.06] bg-[#0c0c0c] shadow-2xl z-[9999] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
              <span className="text-[12px] font-medium text-white/70">Notifications</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] text-indigo-400 hover:text-indigo-300">Mark all read</button>
                )}
                <button onClick={clearAll} className="text-[10px] text-zinc-600 hover:text-zinc-400">Clear</button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[420px]">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-[12px] text-zinc-600">No notifications</div>
              ) : (
                notifications.map(n => {
                  const SevIcon = SEV_ICON[n.severity];
                  const ModIcon = MODULE_ICON[n.module] || Bell;
                  return (
                    <div key={n.id} onClick={() => markAsRead(n.id)}
                      className={cn('px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors', !n.read && 'bg-white/[0.01]')}>
                      <div className="flex items-start gap-2.5">
                        <SevIcon className={cn('w-3.5 h-3.5 mt-0.5 flex-shrink-0', SEV_ICON_CLR[n.severity])} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={cn('text-[11px] font-medium', n.read ? 'text-zinc-500' : 'text-white/80')}>{n.title}</span>
                            {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">{n.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <ModIcon className="w-3 h-3 text-zinc-600" />
                            <span className="text-[9px] text-zinc-600">{n.module}</span>
                            <span className="text-[9px] text-zinc-700">{n.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
