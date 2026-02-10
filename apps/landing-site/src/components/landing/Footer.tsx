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
    <footer className="py-14 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <span className="text-base font-semibold text-gray-900 dark:text-white">AI Nexus</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-xs leading-relaxed">
              Bringing the power of AI to your legacy systems. Connect, query, and transform your data.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            &copy; {new Date().getFullYear()} AI Nexus. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 font-medium">
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
