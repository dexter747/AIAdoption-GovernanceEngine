import Link from 'next/link';
import { Shield, Lock } from 'lucide-react';

const footerLinks = {
 product: [
 { name: 'Features', href: '/#features' },
 { name: 'Pricing', href: '/#pricing' },
 { name: 'Download', href: '/download' },
 { name: 'Changelog', href: '/changelog' },
 ],
 resources: [
 { name: 'Documentation', href: '/docs' },
 { name: 'Blog', href: '/blog' },
 { name: 'Contact', href: '/contact' },
 { name: 'Tutorials', href: '/tutorials' },
 ],
 legal: [
 { name: 'Privacy Policy', href: '/privacy' },
 { name: 'Terms of Service', href: '/terms' },
 { name: 'Refund Policy', href: '/refund' },
 { name: 'Cookie Policy', href: '/cookies' },
 ],
};

export function Footer() {
 return (
 <footer className="py-14 border-t bg-gray-900 border-gray-800">
 <div className="max-w-6xl mx-auto px-6">
 <div className="grid md:grid-cols-5 gap-10 mb-10">
 {/* Brand */}
 <div className="md:col-span-2">
 <Link href="/" className="flex items-center gap-2.5 mb-3">
 <img src="/logo.png" alt="Velanova" className="w-8 h-8 rounded-lg" />
 <span className="font-medium text-white">Velanova</span>
 </Link>
 <p className="font-medium max-w-xs leading-relaxed text-muted-foreground">
 Bringing the power of AI to your legacy systems. Connect, query, and transform your data.
 </p>
 </div>

 {/* Product */}
 <div>
 <h4 className="font-medium uppercase tracking-wider mb-3 text-white">Product</h4>
 <ul className="space-y-2">
 {footerLinks.product.map((item) => (
 <li key={item.name}>
 <Link href={item.href} className="font-medium transition-colors text-muted-foreground hover:text-white">
 {item.name}
 </Link>
 </li>
 ))}
 </ul>
 </div>

 {/* Resources */}
 <div>
 <h4 className="font-medium uppercase tracking-wider mb-3 text-white">Resources</h4>
 <ul className="space-y-2">
 {footerLinks.resources.map((item) => (
 <li key={item.name}>
 <Link href={item.href} className="font-medium transition-colors text-muted-foreground hover:text-white">
 {item.name}
 </Link>
 </li>
 ))}
 </ul>
 </div>

 {/* Legal */}
 <div>
 <h4 className="font-medium uppercase tracking-wider mb-3 text-white">Legal</h4>
 <ul className="space-y-2">
 {footerLinks.legal.map((item) => (
 <li key={item.name}>
 <Link href={item.href} className="font-medium transition-colors text-muted-foreground hover:text-white">
 {item.name}
 </Link>
 </li>
 ))}
 </ul>
 </div>
 </div>

 {/* Bottom */}
 <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 border-gray-800">
 <p className="font-medium text-muted-foreground">
 &copy; {new Date().getFullYear()} Velanova. All rights reserved.
 </p>
 <div className="flex items-center gap-4 font-medium text-muted-foreground">
 <span className="flex items-center gap-1.5">
 <Shield className="w-3.5 h-3.5" />
 SOC 2 Compliant
 </span>
 <span className="flex items-center gap-1.5">
 <Lock className="w-3.5 h-3.5" />
 GDPR Ready
 </span>
 </div>
 </div>
 </div>
 </footer>
 );
}
