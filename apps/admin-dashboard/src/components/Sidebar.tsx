'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
 LayoutDashboard, Users, Download, CreditCard, Settings, 
 LogOut, Key, BarChart2
} from 'lucide-react';

const navigation = [
 { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
 { name: 'Users', href: '/dashboard/users', icon: Users },
 { name: 'Licenses', href: '/dashboard/licenses', icon: Key },
 { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
 { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
 { name: 'Activations', href: '/dashboard/downloads', icon: Download },
 { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
 const pathname = usePathname();
 const router = useRouter();

 const handleSignOut = async () => {
 await fetch('/api/auth/session', { method: 'DELETE' });
 router.push('/login');
 router.refresh();
 };

 return (
 <aside className="w-64 border-r min-h-screen flex flex-col bg-background border-border">
 {/* Logo */}
 <div className="h-16 flex items-center px-6 border-b border-border">
 <Link href="/dashboard" className="flex items-center gap-2">
 <img src="/logo.png" alt="Velanova" className="w-10 h-10 rounded-xl" />
 <span className="text-base font-medium tracking-tight text-foreground">Admin</span>
 </Link>
 </div>

 {/* Navigation */}
 <nav className="flex-1 px-4 py-6">
 <ul className="space-y-1">
 {navigation.map((item) => {
 const isActive = pathname === item.href || 
 (item.href !== '/dashboard' && pathname?.startsWith(item.href));
 return (
 <li key={item.name}>
 <Link
 href={item.href}
 className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
 isActive ? 'bg-zinc-800 text-white' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
 }`}
 >
 <item.icon className="w-5 h-5" />
 {item.name}
 </Link>
 </li>
 );
 })}
 </ul>
 </nav>

 {/* User & Logout */}
 <div className="px-4 py-4 border-t border-border">
 <div className="flex items-center gap-3 px-3 py-2">
 <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
 <span className="text-white text-sm font-medium">A</span>
 </div>
 <div className="flex-1 min-w-0">
 <p className="font-medium truncate text-foreground">Admin</p>
 <p className="text-xs text-muted-foreground truncate">admin@gmail.com</p>
 </div>
 </div>
 <button
 onClick={handleSignOut}
 className="w-full mt-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-zinc-400 transition-colors hover:bg-zinc-950">
 <LogOut className="w-5 h-5" />
 Sign Out
 </button>
 </div>
 </aside>
 );
}
