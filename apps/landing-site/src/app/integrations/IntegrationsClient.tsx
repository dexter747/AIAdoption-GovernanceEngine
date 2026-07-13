'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Boxes,
  GitBranch,
  Search,
  X,
  Cpu,
  Globe,
  Database,
  Server,
  TrendingUp,
  Building2,
  Users,
  Warehouse,
  KanbanSquare,
  MessageSquare,
  UserCheck,
  DollarSign,
  Shield,
  GitBranchIcon,
  Cloud,
  ShoppingCart,
  BarChart3,
  Landmark,
  ChevronRight,
  Lock,
  ToggleLeft,
  Upload,
  FileText,
  Hash,
  List,
  Download,
} from 'lucide-react';
import { Navbar, Footer } from '@/components/landing';
import {
  categories,
  totalIntegrationCount,
  type Integration,
  type ConnectionField,
} from '@/data/integrations-data';

// Map category icon strings to components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu,
  Globe,
  Database,
  Server,
  TrendingUp,
  Building2,
  Users,
  Warehouse,
  KanbanSquare,
  MessageSquare,
  UserCheck,
  DollarSign,
  Shield,
  GitBranch: GitBranchIcon,
  Cloud,
  ShoppingCart,
  BarChart3,
  Landmark,
};

// Field type icons
function FieldIcon({ type }: { type: ConnectionField['type'] }) {
  switch (type) {
    case 'password':
      return <Lock className="w-3.5 h-3.5" />;
    case 'url':
      return <Globe className="w-3.5 h-3.5" />;
    case 'number':
      return <Hash className="w-3.5 h-3.5" />;
    case 'toggle':
      return <ToggleLeft className="w-3.5 h-3.5" />;
    case 'file':
      return <Upload className="w-3.5 h-3.5" />;
    case 'textarea':
      return <FileText className="w-3.5 h-3.5" />;
    case 'select':
      return <List className="w-3.5 h-3.5" />;
    default:
      return <ChevronRight className="w-3.5 h-3.5" />;
  }
}

// ─── Integration Card ───────────────────────────────────────────
function IntegrationCard({ item, onClick }: { item: Integration; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 p-4 rounded-xl border text-left w-full
        border-white/[0.05] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]
        transition-all duration-300 cursor-pointer"
    >
      <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/[0.06] flex items-center justify-center flex-shrink-0 p-1.5">
        {item.logo ? (
          <img src={item.logo} alt={item.name} className="w-full h-full object-contain" />
        ) : (
          <span className="text-xs font-semibold text-zinc-400 uppercase">
            {item.name.slice(0, 2)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white truncate">{item.name}</span>
          {item.tag && (
            <span className="flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/[0.05] text-zinc-600 border border-white/[0.04]">
              {item.tag}
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-600 mt-0.5 truncate">{item.description}</p>
      </div>
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-white/[0.06] text-zinc-500 border border-white/[0.06]">
          {item.connectionType}
        </span>
      </div>
    </button>
  );
}

// ─── Connection Fields Modal ────────────────────────────────────
function ConnectionModal({ item, onClose }: { item: Integration; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-zinc-950 border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/[0.06] flex items-center justify-center p-1.5">
              {item.logo ? (
                <img src={item.logo} alt={item.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs font-semibold text-zinc-400 uppercase">
                  {item.name.slice(0, 2)}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">{item.name}</h3>
              <p className="text-xs text-zinc-500">{item.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Connection Type Badge */}
        <div className="px-6 pt-5">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/[0.06] text-zinc-400 border border-white/[0.06]">
              Connection: {item.connectionType}
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/[0.06] text-zinc-400 border border-white/[0.06]">
              {item.fields.filter(f => f.required).length} required fields
            </span>
          </div>
        </div>

        {/* Fields Preview */}
        <div className="px-6 pb-2 max-h-[50vh] overflow-y-auto">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-600 mb-3">
            Connection Fields
          </p>
          <div className="space-y-2.5">
            {item.fields.map((field, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.04] bg-white/[0.02]"
              >
                <div className="w-7 h-7 rounded-md bg-white/[0.06] flex items-center justify-center text-zinc-500 flex-shrink-0">
                  <FieldIcon type={field.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium">{field.name}</span>
                    {field.required && (
                      <span className="text-[9px] font-bold text-red-400/70">REQUIRED</span>
                    )}
                  </div>
                  {(field.placeholder || field.hint) && (
                    <p className="text-[11px] text-zinc-600 mt-0.5 truncate">
                      {field.hint || field.placeholder}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-zinc-700 font-mono flex-shrink-0">
                  {field.type}
                </span>
              </div>
            ))}
          </div>
          {/* Options preview for select fields */}
          {item.fields
            .filter(f => f.type === 'select' && f.options?.length)
            .map((field, i) => (
              <div key={i} className="mt-3 pl-10">
                <p className="text-[10px] text-zinc-700 mb-1">{field.name} options:</p>
                <div className="flex flex-wrap gap-1">
                  {field.options!.slice(0, 6).map(opt => (
                    <span
                      key={opt}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.03] text-zinc-600 border border-white/[0.04]"
                    >
                      {opt}
                    </span>
                  ))}
                  {field.options!.length > 6 && (
                    <span className="text-[10px] text-zinc-700">
                      +{field.options!.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* CTA */}
        <div className="p-6 border-t border-white/[0.06] mt-4 flex flex-col sm:flex-row gap-3">
          <Link
            href="/download"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-all text-sm shadow-lg shadow-white/5"
          >
            <Download className="w-4 h-4" />
            Download to Connect
          </Link>
          <Link
            href="/docs"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/[0.08] text-zinc-300 font-medium hover:border-white/[0.15] hover:bg-white/[0.03] transition-all text-sm"
          >
            View Docs
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Client Component ──────────────────────────────────────
export function IntegrationsClient() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<Integration | null>(null);

  // Filter categories based on active tab and search
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return categories
      .filter(cat => activeTab === 'all' || cat.id === activeTab)
      .map(cat => ({
        ...cat,
        integrations: q
          ? cat.integrations.filter(
              i =>
                i.name.toLowerCase().includes(q) ||
                i.description.toLowerCase().includes(q) ||
                i.connectionType.toLowerCase().includes(q) ||
                (i.tag && i.tag.toLowerCase().includes(q))
            )
          : cat.integrations,
      }))
      .filter(cat => cat.integrations.length > 0);
  }, [activeTab, search]);

  const filteredCount = filtered.reduce((sum, c) => sum + c.integrations.length, 0);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border mb-5 bg-white/[0.03] border-white/[0.08]">
              <Boxes className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-500">
                {totalIntegrationCount}+ Integrations
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-5 text-white">
              Connect To <span className="text-shimmer">Any System</span>
            </h1>
            <p className="text-lg text-zinc-500 leading-relaxed">
              Pre-built connectors for MCP servers, APIs, databases, ERPs, CRMs, mainframes, and
              more. Each integration has its own unique connection configuration.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-zinc-600 focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.06] transition-all text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/[0.06]"
                >
                  <X className="w-3.5 h-3.5 text-zinc-500" />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mb-10 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max pb-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-white text-black'
                    : 'text-zinc-500 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
                }`}
              >
                All ({totalIntegrationCount})
              </button>
              {categories.map(cat => {
                const Icon = iconMap[cat.icon];
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === cat.id
                        ? 'bg-white text-black'
                        : 'text-zinc-500 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {cat.name}
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        activeTab === cat.id
                          ? 'bg-black/10 text-black/60'
                          : 'bg-white/[0.06] text-zinc-600'
                      }`}
                    >
                      {cat.integrations.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results count when searching */}
          {search && (
            <p className="text-sm text-zinc-500 mb-6">
              {filteredCount} result{filteredCount !== 1 ? 's' : ''} for &quot;
              {search}&quot;
            </p>
          )}

          {/* Category Sections */}
          <div className="space-y-14">
            {filtered.map(category => {
              const Icon = iconMap[category.icon];
              return (
                <div key={category.id}>
                  <div className="flex items-center gap-3 mb-5">
                    {Icon && (
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-zinc-500" />
                      </div>
                    )}
                    <h2 className="text-lg font-medium text-white">{category.name}</h2>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/[0.05] text-zinc-500 border border-white/[0.06]">
                      {category.integrations.length}
                    </span>
                    <div className="flex-1 h-px bg-white/[0.05]" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {category.integrations.map(item => (
                      <IntegrationCard
                        key={item.name}
                        item={item}
                        onClick={() => setSelectedItem(item)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-zinc-500 text-lg mb-2">No integrations found</p>
              <p className="text-zinc-600 text-sm">
                Try a different search term or{' '}
                <button
                  onClick={() => {
                    setSearch('');
                    setActiveTab('all');
                  }}
                  className="text-white underline"
                >
                  clear filters
                </button>
              </p>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-20 text-center">
            <div className="max-w-xl mx-auto p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <h3 className="text-xl font-medium text-white mb-2">Don&apos;t See Your System?</h3>
              <p className="text-zinc-500 mb-6 text-sm">
                We build custom connectors on request. Our SDK also lets your team add any
                integration.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-all text-sm shadow-lg shadow-white/5"
                >
                  <GitBranch className="w-4 h-4" />
                  Request An Integration
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.08] text-zinc-300 font-medium hover:border-white/[0.15] hover:bg-white/[0.03] transition-all text-sm"
                >
                  SDK Documentation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Connection Detail Modal */}
      {selectedItem && (
        <ConnectionModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
