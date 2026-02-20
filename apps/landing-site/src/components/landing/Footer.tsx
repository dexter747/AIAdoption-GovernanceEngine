"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const footerLinks = {
  product: [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Download", href: "/download" },
    { name: "Changelog", href: "/changelog" },
  ],
  resources: [
    { name: "Documentation", href: "/docs" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
    { name: "Tutorials", href: "/tutorials" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Refund Policy", href: "/refund" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
};

export function Footer() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".footer-brand", {
        opacity: 0, y: 20, duration: 0.6,
        scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
      });
      gsap.from(".footer-col", {
        opacity: 0, y: 20, duration: 0.5, stagger: 0.08,
        scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
      });
      gsap.from(".footer-bottom", {
        opacity: 0, duration: 0.5, delay: 0.3,
        scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <footer ref={ref} className="py-16 border-t bg-zinc-950 border-white/[0.06]">
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
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Built for enterprise
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}