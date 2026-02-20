"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Database, Server, Cloud, Box, Boxes, Cpu, HardDrive,
  FileSpreadsheet, ShoppingCart, Users2, Building2, GitBranch, LucideIcon
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Integration {
  name: string;
  icon: LucideIcon;
  category: string;
}

const integrations: Integration[] = [
  { name: "PostgreSQL", icon: Database, category: "Databases" },
  { name: "MySQL", icon: Database, category: "Databases" },
  { name: "Oracle", icon: Database, category: "Databases" },
  { name: "SQL Server", icon: Database, category: "Databases" },
  { name: "MongoDB", icon: Database, category: "Databases" },
  { name: "Redis", icon: Database, category: "Databases" },
  { name: "SAP", icon: Box, category: "ERP" },
  { name: "Oracle EBS", icon: Boxes, category: "ERP" },
  { name: "NetSuite", icon: Building2, category: "ERP" },
  { name: "Salesforce", icon: Cloud, category: "CRM" },
  { name: "HubSpot", icon: Users2, category: "CRM" },
  { name: "Dynamics 365", icon: Server, category: "CRM" },
  { name: "Snowflake", icon: HardDrive, category: "Data Warehouse" },
  { name: "BigQuery", icon: FileSpreadsheet, category: "Data Warehouse" },
  { name: "Redshift", icon: Server, category: "Data Warehouse" },
  { name: "Shopify", icon: ShoppingCart, category: "E-commerce" },
  { name: "Magento", icon: ShoppingCart, category: "E-commerce" },
  { name: "GitHub", icon: GitBranch, category: "Dev Tools" },
  { name: "GitLab", icon: GitBranch, category: "Dev Tools" },
  { name: "AWS RDS", icon: Cpu, category: "Cloud" },
  { name: "Azure SQL", icon: Cloud, category: "Cloud" },
  { name: "Google Cloud", icon: Cloud, category: "Cloud" },
];

const categories = Array.from(new Set(integrations.map((i) => i.category)));

export function IntegrationsSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".integ-header > *", {
        opacity: 0, y: 30, duration: 0.7, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: ".integ-header", start: "top 85%", once: true },
      });

      gsap.from(".integ-tab", {
        opacity: 0, y: 15, duration: 0.4, stagger: 0.05, ease: "power2.out",
        scrollTrigger: { trigger: ".integ-tabs", start: "top 88%", once: true },
      });

      gsap.from(".integ-card", {
        opacity: 0, y: 30, scale: 0.95, duration: 0.5, stagger: 0.04, ease: "power3.out",
        scrollTrigger: { trigger: ".integ-grid", start: "top 85%", once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative py-28 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="integ-header text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border mb-5 bg-white/[0.03] border-white/[0.08]">
            <Boxes className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-500">64+ Integrations</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-5 text-white">
            Connect to{" "}
            <span className="text-shimmer">any system</span>
          </h2>
          <p className="text-lg text-zinc-500 leading-relaxed">
            Pre-built connectors for databases, ERPs, CRMs, data warehouses, and more.
            Add custom connectors via our SDK.
          </p>
        </div>

        {/* Category pills */}
        <div className="integ-tabs flex flex-wrap justify-center gap-2.5 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              className="integ-tab px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 bg-white/[0.03] border border-white/[0.06] text-zinc-500 hover:border-white/[0.12] hover:text-zinc-300"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Cards grid */}
        <div className="integ-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <div
                key={integration.name}
                className="integ-card group p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-400 cursor-pointer card-hover text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:border-white/[0.15] transition-all duration-400">
                  <Icon className="w-7 h-7 text-zinc-400" />
                </div>
                <h3 className="text-sm font-medium text-white mb-1">{integration.name}</h3>
                <div className="text-xs text-zinc-600">{integration.category}</div>
              </div>
            );
          })}

          {/* +40 more card */}
          <div className="integ-card p-5 rounded-2xl border border-white/[0.06] bg-white/[0.01] text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
              <Box className="w-7 h-7 text-zinc-600" />
            </div>
            <h3 className="text-sm font-medium text-zinc-500">+40 More</h3>
            <p className="text-xs text-zinc-700 mt-0.5">Coming soon</p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="mb-5 text-zinc-500">Don&apos;t see your system? We can build custom connectors.</p>
          <a
            href="/integrations"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-all duration-300 shadow-lg shadow-white/5"
          >
            <GitBranch className="w-5 h-5" />
            Explore All Integrations
          </a>
        </div>
      </div>
    </section>
  );
}

export default IntegrationsSection;