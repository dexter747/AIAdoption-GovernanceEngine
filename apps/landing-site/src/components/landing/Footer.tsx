import Link from "next/link";

const footerLinks = {
  product: [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Download", href: "/download" },
    { name: "Release Notes", href: "https://github.com/Nexolve-Technologies-India/AIAdoption-GovernanceEngine/releases" },
  ],
  resources: [
    { name: "Documentation", href: "/docs" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Refund Policy", href: "/refund" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="py-16 border-t bg-zinc-950 border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-10 mb-12">
          <div className="footer-brand md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="Velanova" className="w-10 h-10 rounded-xl" />
              <span className="text-lg font-medium tracking-tight text-white">Velanova</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs text-zinc-500">
              Bringing the power of AI to your legacy systems. Connect, query, and transform your data.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="text-xs font-medium uppercase tracking-[0.15em] mb-4 text-zinc-400">Product</h4>
            <ul className="space-y-2.5">
              {footerLinks.product.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm transition-colors text-zinc-500 hover:text-white">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="text-xs font-medium uppercase tracking-[0.15em] mb-4 text-zinc-400">Resources</h4>
            <ul className="space-y-2.5">
              {footerLinks.resources.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm transition-colors text-zinc-500 hover:text-white">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="text-xs font-medium uppercase tracking-[0.15em] mb-4 text-zinc-400">Legal</h4>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm transition-colors text-zinc-500 hover:text-white">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 border-white/[0.06]">
          <p className="text-sm text-zinc-600">
            &copy; {new Date().getFullYear()} Velanova. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-sm text-zinc-600">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs text-zinc-700 font-medium">Verified by Dodo Payments</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}