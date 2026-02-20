import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  MessageSquare, Settings,
  CreditCard, LogOut,
  Key, UserCircle, Shield, Library, FolderOpen, ChevronUp,
  PanelLeftClose, PanelLeft, Brain,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

const workspaceNav = [
  { name: 'Library',        href: '/library',        icon: Library },
  { name: 'My Connections', href: '/my-connections', icon: FolderOpen },
  { name: 'Contexts',       href: '/contexts',       icon: Brain },
];

const profileMenuItems = [
  { name: 'Profile',  href: '/profile-settings',  icon: UserCircle },
  { name: 'License',  href: '/license',            icon: Shield },
  { name: 'API Keys', href: '/settings/api-keys',  icon: Key },
  { name: 'General',  href: '/settings',           icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** Renders a single nav link — reused across sections */
  const navLink = (
    href: string,
    Icon: React.ElementType,
    label: string,
    exact = true,
  ) => {
    const isActive = exact
      ? location.pathname === href
      : location.pathname.startsWith(href);
    return (
      <Link
        to={href}
        title={collapsed ? label : undefined}
        className={cn(
          'relative flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150',
          collapsed && 'justify-center px-0 w-full',
          isActive
            ? 'bg-white/[0.08] text-white'
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]',
        )}
      >
        {isActive && <span className="nav-active-line" />}
        <Icon
          className={cn(
            'w-[15px] h-[15px] flex-shrink-0',
            isActive ? 'text-white' : 'text-zinc-500',
          )}
        />
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen transition-all duration-300 ease-in-out',
        'bg-[#080808] border-r border-white/[0.055]',
        collapsed ? 'w-[52px]' : 'w-[220px]',
      )}
    >
      {/* ── Header: Logo + collapse toggle ── */}
      <div
        className={cn(
          'h-[52px] flex items-center border-b border-white/[0.055] app-region-drag flex-shrink-0',
          collapsed ? 'justify-center px-0' : 'justify-between px-3',
        )}
      >
        <div
          className={cn(
            'flex items-center gap-2.5 app-region-no-drag',
            collapsed && 'justify-center w-full',
          )}
        >
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-[10px] bg-white/8 blur-sm" />
            <img
              src="/logo.png"
              alt="Velanova"
              className="relative w-8 h-8 rounded-[8px] object-cover ring-1 ring-white/10"
            />
          </div>
          {!collapsed && (
            <span className="text-[14px] font-semibold tracking-tight text-white/90">
              Velanova
            </span>
          )}
        </div>
        {onToggle && !collapsed && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.05] transition-all app-region-no-drag"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Expand button (collapsed state only) ── */}
      {collapsed && onToggle && (
        <div className="px-1.5 pt-2 flex-shrink-0">
          <button
            onClick={onToggle}
            className="w-full p-2 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.05] flex items-center justify-center transition-all"
            title="Expand sidebar"
          >
            <PanelLeft className="w-3.5 h-3.5" />
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
          <p className="px-2.5 mb-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
            Workspace
          </p>
        ) : (
          <div className="h-px bg-white/[0.055] mx-auto mb-2" />
        )}
        <div className="space-y-0.5">
          {workspaceNav.map((item) => (
            <div key={item.href}>{navLink(item.href, item.icon, item.name)}</div>
          ))}
        </div>
      </div>

      {/* ── MCP status card — fills the dead space intentionally ── */}
      <div className="flex-1 flex flex-col items-stretch justify-end px-2 py-4">
        {!collapsed && (
          <div className="rounded-xl border border-white/[0.055] bg-white/[0.018] p-3.5">
            {/* Header row */}
            <div className="flex items-center gap-2.5 mb-3">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[12px] font-medium text-zinc-300">64 MCP Connectors</span>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.05] mb-3" />

            {/* Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-600">Databases &amp; NoSQL</span>
                <span className="text-[11px] font-medium text-zinc-500 tabular-nums">13</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-600">Enterprise Apps</span>
                <span className="text-[11px] font-medium text-zinc-500 tabular-nums">50</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-600">Mainframe</span>
                <span className="text-[11px] font-medium text-zinc-500 tabular-nums">1</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Account section ── */}
      <div className={cn('px-2 pb-2 flex-shrink-0', collapsed && 'px-1.5')}>
        {!collapsed ? (
          <p className="px-2.5 mb-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
            Account
          </p>
        ) : (
          <div className="h-px bg-white/[0.055] mx-auto mb-2" />
        )}
        {navLink('/subscription', CreditCard, 'Subscription')}
      </div>

      {/* ── Profile footer ── */}
      <div
        className={cn(
          'border-t border-white/[0.055] px-2 py-2.5 relative flex-shrink-0',
          collapsed && 'px-1.5',
        )}
        ref={profileMenuRef}
      >
        {/* Profile popup menu */}
        {profileMenuOpen && !collapsed && (
          <div className="absolute bottom-full left-2 right-2 mb-2 rounded-xl border border-white/[0.07] bg-[#0e0e0e] shadow-2xl overflow-hidden z-50 animate-fade-in-up">
            <div className="py-1.5">
              {profileMenuItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setProfileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors',
                      isActive
                        ? 'text-white bg-white/[0.06]'
                        : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]',
                    )}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-white/[0.06] py-1.5">
              <button
                onClick={() => { logout(); setProfileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-zinc-500 hover:text-red-400 hover:bg-white/[0.04] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Profile button */}
        {collapsed ? (
          <Link
            to="/profile-settings"
            className="w-full p-2 rounded-lg transition-all flex items-center justify-center hover:bg-white/[0.05]"
            title={user?.name || 'Profile'}
          >
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-7 h-7 rounded-full ring-1 ring-white/10"
              />
            ) : (
              <div className="w-7 h-7 bg-white/[0.08] rounded-full flex items-center justify-center ring-1 ring-white/[0.07]">
                <span className="text-white text-xs font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </Link>
        ) : (
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className={cn(
              'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all text-left',
              profileMenuOpen ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]',
            )}
          >
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-7 h-7 rounded-full ring-1 ring-white/10 flex-shrink-0"
              />
            ) : (
              <div className="w-7 h-7 bg-white/[0.08] rounded-full flex items-center justify-center ring-1 ring-white/[0.07] flex-shrink-0">
                <span className="text-white text-xs font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white truncate leading-tight">
                {user?.name || 'User'}
              </p>
              <p className="text-[11px] text-zinc-600 truncate leading-tight">
                {user?.email || ''}
              </p>
            </div>
            <ChevronUp
              className={cn(
                'w-3.5 h-3.5 text-zinc-600 flex-shrink-0 transition-transform duration-200',
                profileMenuOpen ? 'rotate-180' : '',
              )}
            />
          </button>
        )}
      </div>
    </aside>
  );
}
