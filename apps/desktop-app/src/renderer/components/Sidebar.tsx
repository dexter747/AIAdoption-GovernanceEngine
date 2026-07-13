import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCachedAvatar } from '../hooks/useCachedAvatar';
import { NotificationBell } from './ui/NotificationSystem';
import { useTheme } from '../context/ThemeContext';
import {
  MessageSquare,
  Settings,
  CreditCard,
  LogOut,
  Key,
  UserCircle,
  Shield,
  Library,
  FolderOpen,
  PanelLeftClose,
  PanelLeft,
  Brain,
  BarChart3,
  Kanban,
  Users2,
  Scale,
  ShoppingCart,
  ScanSearch,
  ShieldAlert,
  Banknote,
  Leaf,
  FileText,
  ClipboardList,
  Globe,
  Sparkles,
  Database,
  Workflow,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '../lib/utils';

const workspaceNav = [
  { name: 'Library', href: '/library', icon: Library },
  { name: 'My Connections', href: '/my-connections', icon: FolderOpen },
  { name: 'Contexts', href: '/contexts', icon: Brain },
];

const solutionsNav = [
  { name: 'Business Intel', href: '/business-intel', icon: BarChart3 },
  { name: 'Project Intel', href: '/project-intel', icon: Kanban },
  { name: 'Resources', href: '/resource-planning', icon: Users2 },
  { name: 'Regulatory', href: '/regulatory-intel', icon: Scale },
  { name: 'Procurement', href: '/procurement', icon: ShoppingCart },
  { name: 'KYC', href: '/kyc', icon: ScanSearch },
  { name: 'Fraud Detection', href: '/fraud-detection', icon: ShieldAlert },
  { name: 'AML / SAR', href: '/aml', icon: Banknote },
  { name: 'ESG', href: '/esg', icon: Leaf },
  { name: 'Reporting', href: '/client-reporting', icon: FileText },
  { name: 'Audit Trail', href: '/audit-trail', icon: ClipboardList },
  { name: 'Risk Heatmap', href: '/risk-heatmap', icon: Globe },
  { name: 'Exec Summary', href: '/executive-summary', icon: Sparkles },
  { name: 'Compliance', href: '/compliance-matrix', icon: Shield },
  { name: 'Data Sovereignty', href: '/data-sovereignty', icon: Database },
  { name: 'Jurisdictions', href: '/multi-jurisdiction', icon: Globe },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
  { name: 'AI Governance', href: '/ai-governance', icon: Brain },
  { name: 'Bias Monitor', href: '/bias-monitoring', icon: Scale },
  { name: 'Sanctions', href: '/sanctions-screening', icon: ShieldAlert },
];

const settingsNav = [
  { name: 'Profile', href: '/profile-settings', icon: UserCircle },
  { name: 'API Keys', href: '/settings/api-keys', icon: Key },
  { name: 'License', href: '/license', icon: Shield },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const avatarUrl = useCachedAvatar(user?.image);
  const { theme, toggleTheme } = useTheme();

  /** Renders a single nav link — reused across sections */
  const navLink = (href: string, Icon: React.ElementType, label: string, exact = true) => {
    const isActive = exact ? location.pathname === href : location.pathname.startsWith(href);
    return (
      <Link
        to={href}
        title={collapsed ? label : undefined}
        className={cn(
          'relative flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150',
          collapsed && 'justify-center px-0 w-full'
        )}
        style={{
          background: isActive ? 'var(--nav-active-bg)' : 'transparent',
          color: isActive ? 'var(--nav-active-text)' : 'var(--nav-default-text)',
        }}
        onMouseEnter={e => {
          if (!isActive) {
            (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
            (e.currentTarget as HTMLElement).style.color = 'var(--nav-hover-text)';
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--nav-default-text)';
          }
        }}
      >
        {isActive && <span className="nav-active-line" />}
        <Icon
          className="w-[15px] h-[15px] flex-shrink-0"
          style={{ color: isActive ? 'var(--nav-active-text)' : 'var(--nav-default-text)' }}
        />
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen transition-all duration-300 ease-in-out',
        collapsed ? 'w-[52px]' : 'w-[220px]'
      )}
      style={{
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* ── Header: Logo + collapse toggle + theme toggle ── */}
      <div
        className={cn(
          'h-[52px] flex items-center app-region-drag flex-shrink-0',
          collapsed ? 'justify-center px-0' : 'justify-between px-3'
        )}
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div
          className={cn(
            'flex items-center gap-2.5 app-region-no-drag',
            collapsed && 'justify-center w-full'
          )}
        >
          <div className="relative flex-shrink-0">
            <div
              className="absolute inset-0 rounded-[10px] blur-sm"
              style={{ background: 'var(--nav-active-bg)' }}
            />
            <img
              src="/logo.png"
              alt="Velanova"
              className="relative w-8 h-8 rounded-[8px] object-cover"
              style={{ boxShadow: '0 0 0 1px var(--avatar-ring)' }}
            />
          </div>
          {!collapsed && (
            <span
              className="text-[14px] font-medium tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Velanova
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 app-region-no-drag">
          {!collapsed && <NotificationBell />}
          {!collapsed && (
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md transition-all"
              style={{ color: 'var(--text-tertiary)' }}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          {onToggle && !collapsed && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md transition-all"
              style={{ color: 'var(--text-tertiary)' }}
              title="Collapse sidebar"
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Expand button (collapsed state only) ── */}
      {collapsed && onToggle && (
        <div className="px-1.5 pt-2 flex-shrink-0">
          <button
            onClick={onToggle}
            className="w-full p-2 rounded-lg flex items-center justify-center transition-all"
            style={{ color: 'var(--text-tertiary)' }}
            title="Expand sidebar"
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </button>
          {/* Theme toggle in collapsed state */}
          <button
            onClick={toggleTheme}
            className="w-full p-2 rounded-lg flex items-center justify-center transition-all mt-0.5"
            style={{ color: 'var(--text-tertiary)' }}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      {/* ── Primary: Chat ── */}
      <div className={cn('px-2 pt-3 flex-shrink-0', collapsed && 'px-1.5')}>
        {navLink('/', MessageSquare, 'Chat')}
      </div>

      {/* ── Workspace section ── */}
      <div className={cn('px-2 pt-5 flex-shrink-0', collapsed && 'px-1.5')}>
        {!collapsed ? (
          <p
            className="px-2.5 mb-1.5 text-[10px] font-medium uppercase tracking-widest"
            style={{ color: 'var(--nav-section-label)' }}
          >
            Workspace
          </p>
        ) : (
          <div className="h-px mx-auto mb-2" style={{ background: 'var(--border-subtle)' }} />
        )}
        <div className="space-y-0.5">
          {workspaceNav.map(item => (
            <div key={item.href}>{navLink(item.href, item.icon, item.name)}</div>
          ))}
        </div>
      </div>

      {/* ── Solutions section ── */}
      <div className={cn('px-2 pt-5 flex-shrink-0', collapsed && 'px-1.5')}>
        {!collapsed ? (
          <p
            className="px-2.5 mb-1.5 text-[10px] font-medium uppercase tracking-widest"
            style={{ color: 'var(--nav-section-label)' }}
          >
            Solutions
          </p>
        ) : (
          <div className="h-px mx-auto mb-2" style={{ background: 'var(--border-subtle)' }} />
        )}
        <div className="space-y-0.5">
          {solutionsNav.map(item => (
            <div key={item.href}>{navLink(item.href, item.icon, item.name)}</div>
          ))}
        </div>
      </div>

      {/* ── Settings section ── */}
      <div className={cn('px-2 pt-5 flex-shrink-0', collapsed && 'px-1.5')}>
        {!collapsed ? (
          <p
            className="px-2.5 mb-1.5 text-[10px] font-medium uppercase tracking-widest"
            style={{ color: 'var(--nav-section-label)' }}
          >
            Settings
          </p>
        ) : (
          <div className="h-px mx-auto mb-2" style={{ background: 'var(--border-subtle)' }} />
        )}
        <div className="space-y-0.5">
          {settingsNav.map(item => (
            <div key={item.href}>{navLink(item.href, item.icon, item.name)}</div>
          ))}
        </div>
      </div>

      {/* ── MCP status card ── */}
      <div className="flex-1 flex flex-col items-stretch justify-end px-2 py-4">
        {!collapsed && (
          <div
            className="rounded-xl p-3.5"
            style={{
              border: '1px solid var(--border-subtle)',
              background: 'var(--card-surface)',
            }}
          >
            {/* Header row */}
            <div className="flex items-center gap-2.5 mb-3">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>
                64 MCP Connectors
              </span>
            </div>

            {/* Divider */}
            <div className="h-px mb-3" style={{ background: 'var(--card-divider)' }} />

            {/* Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  Databases &amp; NoSQL
                </span>
                <span
                  className="text-[11px] font-medium tabular-nums"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  13
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  Enterprise Apps
                </span>
                <span
                  className="text-[11px] font-medium tabular-nums"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  50
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  Mainframe
                </span>
                <span
                  className="text-[11px] font-medium tabular-nums"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  1
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Subscription ── */}
      <div className={cn('px-2 pb-2 flex-shrink-0', collapsed && 'px-1.5')}>
        {navLink('/subscription', CreditCard, 'Subscription')}
      </div>

      {/* ── Profile footer: user identity + logout ── */}
      <div
        className={cn('px-2 py-2 flex-shrink-0', collapsed && 'px-1.5')}
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        {collapsed ? (
          <Link
            to="/profile-settings"
            className="w-full p-2 rounded-lg transition-all flex items-center justify-center"
            title={user?.name || 'Profile'}
            onMouseEnter={e =>
              ((e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)')
            }
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.name}
                className="w-7 h-7 rounded-full"
                style={{ boxShadow: '0 0 0 1px var(--avatar-ring)' }}
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: 'var(--avatar-bg)',
                  boxShadow: '0 0 0 1px var(--avatar-ring)',
                }}
              >
                <span className="text-xs font-medium" style={{ color: 'var(--nav-active-text)' }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </Link>
        ) : (
          <div className="flex items-center gap-2 px-1">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.name}
                className="w-7 h-7 rounded-full flex-shrink-0"
                style={{ boxShadow: '0 0 0 1px var(--avatar-ring)' }}
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'var(--avatar-bg)',
                  boxShadow: '0 0 0 1px var(--avatar-ring)',
                }}
              >
                <span className="text-xs font-medium" style={{ color: 'var(--nav-active-text)' }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p
                className="text-[12px] font-medium truncate leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {user?.name || 'User'}
              </p>
              <p
                className="text-[10.5px] truncate leading-tight"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {user?.email || ''}
              </p>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="p-1.5 rounded-md transition-all flex-shrink-0"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = '#f87171';
                (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
