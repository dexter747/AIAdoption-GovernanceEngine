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
 <aside className="w-64 border-r min-h-screen flex flex-col bg-black border-white/[0.06]">
 {/* Logo */}
 <div className="h-16 flex items-center px-6 border-b border-white/[0.06]">
 <Link href="/dashboard" className="flex items-center gap-2.5">
 <img src="/logo.png" alt="Velanova" className="w-8 h-8 rounded-lg" />
 <span className="text-sm font-medium tracking-tight text-white">Velanova</span>
 <span className="text-xs px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-500 font-medium">Admin</span>
 </Link>
 </div>

 {/* Navigation */}
 <nav className="flex-1 px-3 py-5">
 <p className="px-3 mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-600">Navigation</p>
 <ul className="space-y-0.5">
 {navigation.map((item) => {
 const isActive = pathname === item.href ||
 (item.href !== '/dashboard' && pathname?.startsWith(item.href));
 return (
 <li key={item.name}>
 <Link
 href={item.href}
 className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
 isActive
 ? 'bg-white/[0.08] text-white'
 : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
 }`}
 >
 <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-600'}`} />
 {item.name}
 </Link>
 </li>
 );
 })}
 </ul>
 </nav>

 {/* User & Logout */}
 <div className="px-3 py-4 border-t border-white/[0.06]">
 <div className="flex items-center gap-3 px-3 py-2 mb-1">
 <div className="w-7 h-7 bg-white/[0.08] rounded-full flex items-center justify-center flex-shrink-0">
 <span className="text-zinc-300 text-xs font-medium">A</span>
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium truncate text-white">Admin</p>
 <p className="text-xs text-zinc-600 truncate">admin@velanova.com</p>
 </div>
 </div>
 <button
 onClick={handleSignOut}
 className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-all duration-150">
 <LogOut className="w-4 h-4" />
 Sign Out
 </button>
 </div>
 </aside>
 );
}
