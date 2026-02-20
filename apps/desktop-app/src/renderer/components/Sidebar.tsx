import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
 MessageSquare, Settings, 
 CreditCard, LogOut,
 Key, UserCircle, Shield, Library, FolderOpen, ChevronUp,
 PanelLeftClose, PanelLeft, Brain
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

const navigation = [
 { name: 'Dashboard', href: '/', icon: MessageSquare },
 { name: 'Library', href: '/library', icon: Library },
 { name: 'My Connections', href: '/my-connections', icon: FolderOpen },
 { name: 'Contexts', href: '/contexts', icon: Brain },
 { name: 'Subscription', href: '/subscription', icon: CreditCard },
];

const profileMenuItems = [
 { name: 'Profile', href: '/profile-settings', icon: UserCircle },
 { name: 'License', href: '/license', icon: Shield },
 { name: 'API Keys', href: '/settings/api-keys', icon: Key },
 { name: 'General', href: '/settings', icon: Settings },
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

 return (
    <aside
      className={cn(
        "bg-background border-r min-h-screen flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo & Toggle */}
      <div className="h-14 flex items-center justify-between px-3 border-b app-region-drag">
        <div
          className={cn(
            "flex items-center gap-2 app-region-no-drag",
            collapsed && "justify-center w-full"
          )}
        >
          <img
            src="/logo.png"
            alt="Velanova"
            className="w-6 h-6 rounded-md flex-shrink-0"
          />
          {!collapsed && (
            <span className="font-medium text-white">Velanova</span>
          )}
        </div>
        {onToggle && !collapsed && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md text-muted-foreground app-region-no-drag hover:bg-gray-800"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && onToggle && (
        <div className="px-2 py-2">
          <button
            onClick={onToggle}
            className="w-full p-2 rounded-md text-muted-foreground flex items-center justify-center hover:bg-gray-800"
            title="Expand sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    collapsed && "justify-center px-2",
                    isActive
                      ? "bg-blue-500 text-white"
                      : "text-muted-foreground hover:text-white hover:bg-gray-900"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

 {/* User & Logout */}
 <div className={cn("px-2 py-3 border-t relative border-gray-800", collapsed && "px-1")} ref={profileMenuRef}>
 {/* Profile Menu Popup */}
 {profileMenuOpen && !collapsed && (
 <div className="absolute bottom-full left-2 right-2 mb-2 rounded-xl shadow-2xl overflow-hidden z-50 bg-zinc-900 border-gray-800">
 <div className="py-2">
 {profileMenuItems.map((item) => {
 const isActive = location.pathname === item.href;
 return (
 <Link
 key={item.name}
 to={item.href}
 onClick={() => setProfileMenuOpen(false)}
 className={cn(
 "flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors",
 isActive
 ? 'text-blue-500 bg-blue-500/10'
 : 'text-gray-300 hover:bg-background/5'
 )}
 >
 <item.icon className="w-4 h-4" />
 {item.name}
 </Link>
 );
 })}
 </div>
 </div>
 )}
 
 {/* Profile Button */}
 {collapsed ? (
 <Link
 to="/profile-settings"
 className="w-full p-2 rounded-lg transition-colors flex items-center justify-center hover:bg-gray-900"
 title={user?.name || 'Profile'}
 >
 {user?.image ? (
 <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full" />
 ) : (
 <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
 <span className="text-white text-sm font-medium">
 {user?.name?.charAt(0) || 'U'}
 </span>
 </div>
 )}
 </Link>
 ) : (
 <button
 onClick={() => setProfileMenuOpen(!profileMenuOpen)}
 className="w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors hover:bg-gray-900"
 >
 {user?.image ? (
 <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full" />
 ) : (
 <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
 <span className="text-white text-sm font-medium">
 {user?.name?.charAt(0) || 'U'}
 </span>
 </div>
 )}
 <div className="flex-1 min-w-0 text-left">
 <p className="font-medium truncate text-white">
 {user?.name || 'User'}
 </p>
 <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
 </div>
            <ChevronUp
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                profileMenuOpen ? "rotate-180" : ""
              )}
            />
          </button>
        )}

        <button
          onClick={logout}
          title="Sign Out"
          className={cn(
            "w-full mt-2 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-500 hover:bg-red-950 transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && "Sign Out"}
        </button>
      </div>
    </aside>
  );
}
