import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database, Sparkles, Settings, LayoutDashboard } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-secondary/50">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <h1 className="text-xl font-medium">AI Nexus</h1>
        </div>
        <nav className="p-4 space-y-2">
          <NavLink to="/" icon={<LayoutDashboard size={20} />} active={isActive('/')}>
            Dashboard
          </NavLink>
          <NavLink to="/connections" icon={<Database size={20} />} active={isActive('/connections')}>
            Connections
          </NavLink>
          <NavLink to="/queries" icon={<Sparkles size={20} />} active={isActive('/queries')}>
            AI Queries
          </NavLink>
          <NavLink to="/settings" icon={<Settings size={20} />} active={isActive('/settings')}>
            Settings
          </NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="h-full p-8">{children}</div>
      </main>
    </div>
  );
}

interface NavLinkProps {
  to: string;
  icon: ReactNode;
  children: ReactNode;
  active: boolean;
}

function NavLink({ to, icon, children, active }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
