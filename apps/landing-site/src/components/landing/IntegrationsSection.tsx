"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Boxes, GitBranch, Plus } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Top featured integrations — shown as hero cards
const featured = [
  { name: "Salesforce", logo: "/legacy/salesforce.png", description: "CRM & Sales Cloud", color: "from-blue-950/40 to-transparent" },
  { name: "SAP", logo: "/legacy/saphana.svg", description: "ERP & S/4HANA", color: "from-zinc-900/60 to-transparent" },
  { name: "Oracle", logo: "/legacy/oracle.svg", description: "Database & EBS", color: "from-red-950/30 to-transparent" },
  { name: "Snowflake", logo: "/legacy/snowflake.svg", description: "Data Warehouse", color: "from-cyan-950/30 to-transparent" },
  { name: "HubSpot", logo: "/legacy/hubspot.svg", description: "CRM & Marketing", color: "from-orange-950/30 to-transparent" },
];

// Category summary counts
const categorySummary = [
  { name: "Databases", count: 14, examples: "PostgreSQL, MySQL, MongoDB, Oracle, SQL Server, Redis" },
  { name: "ERP", count: 8, examples: "SAP, Oracle EBS, NetSuite, Microsoft Dynamics, Infor" },
  { name: "CRM", count: 7, examples: "Salesforce, HubSpot, Dynamics 365, Pipedrive, Zoho" },
  { name: "Data Warehouse", count: 9, examples: "Snowflake, BigQuery, Redshift, Azure Synapse, Databricks" },
  { name: "E-commerce", count: 6, examples: "Shopify, Magento, WooCommerce, BigCommerce" },
  { name: "Dev Tools", count: 5, examples: "GitHub, GitLab, Jira, Confluence, Jenkins" },
  { name: "Cloud", count: 8, examples: "AWS RDS, Azure SQL, Google Cloud SQL, Aurora" },
  { name: "Other", count: 7, examples: "ServiceNow, Workday, Zendesk, Tableau, Power BI" },
];

const totalCount = categorySummary.reduce((sum, c) => sum + c.count, 0);

export function IntegrationsSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".integ-header > *", {
        opacity: 0, y: 30, duration: 0.7, stagger: 0.12, ease: "power3.out", immediateRender: false,
        scrollTrigger: { trigger: ".integ-header", start: "top 85%", once: true },
      });
      gsap.from(".feat-card", {
        opacity: 0, y: 30, duration: 0.6, stagger: 0.08, ease: "power3.out", immediateRender: false,
        scrollTrigger: { trigger: ".feat-row", start: "top 85%", once: true },
      });
      gsap.from(".cat-pill", {
        opacity: 0, y: 12, duration: 0.4, stagger: 0.06, ease: "power2.out", immediateRender: false,
        scrollTrigger: { trigger: ".cat-grid", start: "top 88%", once: true },
      });
      gsap.from(".integ-bottom", {
        opacity: 0, y: 20, duration: 0.5, immediateRender: false,
        scrollTrigger: { trigger: ".integ-bottom", start: "top 92%", once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative py-16 bg-black">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="integ-header text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border mb-5 bg-white/[0.03] border-white/[0.08]">
            <Boxes className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-500">{totalCount}+ Integrations</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-5 text-white">
            Connect To{" "}
            <span className="text-shimmer">Any System</span>
          </h2>
          <p className="text-lg text-zinc-500 leading-relaxed">
            Pre-built connectors for databases, ERPs, CRMs, data warehouses, and more.
            Add custom connectors via our SDK.
          </p>
        </div>

        {/* Featured 5 cards */}
        <div className="feat-row grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {featured.map((item) => (
            <div
              key={item.name}
              className={`feat-card relative p-6 rounded-2xl border border-white/[0.06] bg-gradient-to-br ${item.color} bg-white/[0.02] hover:border-white/[0.12] transition-all duration-300 card-hover text-center overflow-hidden`}
            >
              <div className="w-14 h-14 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mx-auto mb-4 p-2.5">
                <img src={item.logo} alt={item.name} className="w-full h-full object-contain" />
              </div>
              <div className="text-sm font-medium text-white mb-1">{item.name}</div>
              <div className="text-xs text-zinc-500">{item.description}</div>
            </div>
          ))}
        </div>

        {/* "+ N more" indicator row */}
        <div className="flex items-center justify-center gap-3 mb-14">
          <div className="h-px flex-1 bg-white/[0.04]" />
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
            <Plus className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-400">{totalCount - featured.length} more connectors across all categories</span>
          </div>
          <div className="h-px flex-1 bg-white/[0.04]" />
        </div>

        {/* Category summary pills */}
        <div className="cat-grid flex flex-wrap justify-center gap-3 mb-10">
          {categorySummary.map((cat) => (
            <div
              key={cat.name}
              title={cat.examples}
              className="cat-pill group flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300 cursor-default"
            >
              <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">{cat.name}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-500 group-hover:text-zinc-300 transition-colors">{cat.count}</span>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="integ-bottom text-center">
          <p className="mb-5 text-zinc-500">Don&apos;t see your system? We build custom connectors on request.</p>
          <a
            href="/integrations"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-all duration-300 shadow-lg shadow-white/5 text-sm"
          >
            <GitBranch className="w-4 h-4" />
            Browse All Integrations
          </a>
        </div>
      </div>
    </section>
  );
}

export default IntegrationsSection;