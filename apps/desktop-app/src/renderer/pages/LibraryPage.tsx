import { useState, useEffect } from 'react';
import {
  Search,
  Grid3x3,
  List,
  Plus,
  Check,
  Database,
  HardDrive,
  Warehouse,
  Zap,
  Loader2,
  Building2,
  Briefcase,
  Users,
  Heart,
  Shield,
  Truck,
  Banknote,
  ShoppingCart,
  Radio,
  FileText,
  Landmark,
  GraduationCap,
  Wrench,
  ShoppingBag,
  Monitor,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CONNECTION_LIBRARY } from '../config/connection-types';
import ConnectionIcon from '../components/ConnectionIcon';

const CATEGORIES = [
  { id: 'all', name: 'All', icon: Grid3x3 },
  { id: 'database', name: 'Databases', icon: Database },
  { id: 'nosql', name: 'NoSQL', icon: HardDrive },
  { id: 'enterprise', name: 'Enterprise', icon: Building2 },
  { id: 'erp', name: 'ERP', icon: Briefcase },
  { id: 'crm', name: 'CRM & Sales', icon: Users },
  { id: 'hcm', name: 'HCM & HR', icon: Heart },
  { id: 'healthcare', name: 'Healthcare', icon: Heart },
  { id: 'insurance', name: 'Insurance', icon: Shield },
  { id: 'supply-chain', name: 'Supply Chain', icon: Truck },
  { id: 'finance', name: 'Finance', icon: Banknote },
  { id: 'commerce', name: 'Commerce', icon: ShoppingCart },
  { id: 'telecom', name: 'Telecom', icon: Radio },
  { id: 'document', name: 'Documents', icon: FileText },
  { id: 'government', name: 'Government', icon: Landmark },
  { id: 'education', name: 'Education', icon: GraduationCap },
  { id: 'asset', name: 'Assets', icon: Wrench },
  { id: 'procurement', name: 'Procurement', icon: ShoppingBag },
  { id: 'legacy', name: 'Mainframe', icon: Monitor },
  { id: 'warehouse', name: 'Data Warehouse', icon: Warehouse },
  { id: 'mcp', name: 'MCP & APIs', icon: Zap },
];

interface ConnectionConfig {
  type: string;
  name: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  [key: string]: any;
}

export default function LibraryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [userConnections, setUserConnections] = useState<string[]>([]);
  const [addError, setAddError] = useState<string | null>(null);
  const [connectionConfig, setConnectionConfig] = useState<ConnectionConfig>({
    type: '',
    name: '',
    host: '',
    port: 5432,
    database: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    loadUserConnections();
  }, []);

  const loadUserConnections = async () => {
    try {
      // Try MCP (local) first, fall back to Express API
      const conns =
        (await window.electron.mcp?.getAllConnections?.()) ||
        (await window.electron.express?.getUserConnections?.()) ||
        [];
      const result = conns as any;
      const connsArray = Array.isArray(result) ? result : result?.data || [];
      setUserConnections(connsArray.map((c: any) => c.type));
    } catch (error: any) {
      // Silently handle API key errors - user might not have backend configured yet
      if (!error?.message?.includes('Invalid API key')) {
        console.error('Failed to load connections:', error);
      }
    }
  };

  const filteredConnections = Object.entries(CONNECTION_LIBRARY).filter(([_key, value]) => {
    const matchesSearch =
      value.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      value.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || value.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddConnection = (type: string) => {
    const connType = CONNECTION_LIBRARY[type as keyof typeof CONNECTION_LIBRARY];
    setSelectedType(type);
    setConnectionConfig({
      type,
      name: `My ${connType.name}`,
      host: '',
      port:
        type === 'mysql' || type === 'mariadb'
          ? 3306
          : type === 'postgres'
            ? 5432
            : type === 'mongodb'
              ? 27017
              : type === 'redis'
                ? 6379
                : 5432,
      database: '',
      username: '',
      password: '',
    });
    setShowAddModal(true);
  };

  const saveConnection = async () => {
    if (!connectionConfig.name) return;

    setIsAdding(true);
    setAddError(null);
    try {
      const expressAPI = window.electron.express;
      const mcpAPI = window.electron.mcp;
      let saved = false;

      // Try Express API first
      if (expressAPI?.addUserConnection) {
        try {
          await expressAPI.addUserConnection(connectionConfig.name, connectionConfig.type, {
            host: connectionConfig.host,
            port: connectionConfig.port,
            database: connectionConfig.database,
            username: connectionConfig.username,
            password: connectionConfig.password,
            encrypted: true,
          });
          saved = true;
        } catch (expressErr: any) {
          console.warn('Express API failed, trying MCP fallback:', expressErr?.message);
        }
      }

      // Fallback to MCP if Express failed or unavailable
      if (!saved && mcpAPI?.addConnection) {
        await mcpAPI.addConnection({
          name: connectionConfig.name,
          type: connectionConfig.type as any,
          host: connectionConfig.host,
          port: connectionConfig.port,
          enabled: true,
        });
        saved = true;
      }

      if (!saved) {
        throw new Error(
          'No backend available to save the connection. Check that the server is running.'
        );
      }

      setShowAddModal(false);
      setSelectedType(null);
      await loadUserConnections();
      navigate('/my-connections');
    } catch (error: any) {
      console.error('Failed to create connection:', error);
      setAddError(error?.message || 'Failed to add connection');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    /* Desktop panel — fills the parent main element exactly */
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="toolbar app-region-drag">
        <h1 className="text-[13px] font-medium text-white/80 mr-3 app-region-no-drag select-none">
          Library
        </h1>
        <div className="w-px h-4 bg-white/[0.08] mx-1" />
        {/* Search */}
        <div className="relative app-region-no-drag">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
          <input
            type="text"
            placeholder="Search connectors…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-desktop pl-7 w-52"
          />
        </div>
        {/* spacer */}
        <div className="flex-1" />
        {/* View toggle */}
        <div className="flex items-center gap-0.5 bg-white/[0.05] rounded-[6px] p-0.5 app-region-no-drag">
          {(
            [
              ['grid', Grid3x3],
              ['list', List],
            ] as const
          ).map(([mode, Icon]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                'p-1.5 rounded-[5px] transition-all',
                viewMode === mode
                  ? 'bg-white/[0.1] text-white'
                  : 'text-white/30 hover:text-white/60'
              )}
            >
              <Icon className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Category Tab Bar ─────────────────────────────────── */}
      <div
        className="flex items-center gap-1 px-3 py-2 border-b border-white/[0.055] overflow-x-auto flex-shrink-0 bg-[#0b0b0b]"
        style={{ scrollbarWidth: 'none' }}
      >
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              'tab-strip-item flex-shrink-0',
              selectedCategory === cat.id ? 'is-active' : ''
            )}
          >
            <cat.icon className="w-3 h-3" />
            {cat.name}
          </button>
        ))}
      </div>

      {/* ── Scrollable content ───────────────────────────────── */}
      <div className="flex-1 overflow-auto p-4 bg-[#0b0b0b]">
        {filteredConnections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <Database className="w-8 h-8 text-white/15" />
            <p className="text-[12px] text-white/30">No connectors match your search</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-2.5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {filteredConnections.map(([key, conn]) => {
              const isAdded = userConnections.includes(key);
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    'group relative flex flex-col gap-2.5 p-3 rounded-lg border cursor-default',
                    'bg-[#111] hover:bg-[#151515] transition-colors',
                    isAdded ? 'border-white/[0.07]' : 'border-white/[0.06] hover:border-white/[0.1]'
                  )}
                >
                  {isAdded && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white/[0.06] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white/50" />
                    </div>
                  )}
                  <ConnectionIcon
                    logo={conn.logo}
                    icon={conn.icon}
                    color={conn.color}
                    bgColor={conn.bgColor}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-white/80 leading-tight truncate">
                      {conn.name}
                    </p>
                    <p className="text-[11px] text-white/35 leading-tight mt-0.5 line-clamp-2">
                      {conn.description}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      isAdded ? navigate('/my-connections') : handleAddConnection(key)
                    }
                    className={cn(
                      'h-6 w-full rounded-[5px] text-[11px] font-medium transition-all flex items-center justify-center gap-1.5',
                      isAdded
                        ? 'bg-white/[0.04] text-white/30 hover:bg-white/[0.07]'
                        : 'bg-white/[0.07] text-white/70 hover:bg-white/[0.12] hover:text-white'
                    )}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3 h-3" />
                        Added
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        Add
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* List view */
          <div className="rounded-lg border border-white/[0.07] overflow-hidden">
            {filteredConnections.map(([key, conn], i) => {
              const isAdded = userConnections.includes(key);
              return (
                <div
                  key={key}
                  className={cn('data-row', i % 2 === 0 ? 'bg-[#0e0e0e]' : 'bg-[#0b0b0b]')}
                >
                  <ConnectionIcon
                    logo={conn.logo}
                    icon={conn.icon}
                    color={conn.color}
                    bgColor={conn.bgColor}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[12.5px] font-medium text-white/80">{conn.name}</span>
                    <span className="ml-2 text-[11px] text-white/35">{conn.description}</span>
                  </div>
                  <button
                    onClick={() =>
                      isAdded ? navigate('/my-connections') : handleAddConnection(key)
                    }
                    className={cn(
                      'h-6 px-3 rounded-[5px] text-[11px] font-medium flex items-center gap-1.5 flex-shrink-0 transition-all',
                      isAdded
                        ? 'bg-white/[0.04] text-white/30 hover:bg-white/[0.07]'
                        : 'bg-white/[0.07] text-white/70 hover:bg-white/[0.12]'
                    )}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3 h-3" />
                        Added
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        Add
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add Connection Sheet ──────────────────────────────── */}
      <AnimatePresence>
        {showAddModal &&
          selectedType &&
          (() => {
            const ct = CONNECTION_LIBRARY[selectedType as keyof typeof CONNECTION_LIBRARY];
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                onClick={() => {
                  setShowAddModal(false);
                  setAddError(null);
                }}
              >
                <motion.div
                  initial={{ scale: 0.97, opacity: 0, y: 4 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.97, opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="w-[420px] rounded-xl border border-white/[0.09] bg-[#111] shadow-2xl overflow-hidden"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Sheet header */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07]">
                    <ConnectionIcon
                      logo={ct?.logo}
                      icon={ct?.icon ?? ''}
                      color={ct?.color ?? ''}
                      bgColor={ct?.bgColor ?? ''}
                      size="sm"
                    />
                    <div>
                      <p className="text-[13px] font-medium text-white/90">Add {ct?.name}</p>
                      <p className="text-[11px] text-white/40">Configure connection credentials</p>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="px-5 py-4 space-y-3">
                    {addError && (
                      <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg border border-red-500/20 bg-red-950/20 text-[11px] text-red-400/80">
                        <span className="flex-shrink-0 mt-0.5">⚠</span>
                        <span>{addError}</span>
                      </div>
                    )}
                    {[
                      { label: 'Name', key: 'name', placeholder: `My ${ct?.name}`, type: 'text' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1">
                          {f.label}
                        </label>
                        <input
                          type={f.type}
                          placeholder={f.placeholder}
                          value={(connectionConfig as any)[f.key]}
                          onChange={e =>
                            setConnectionConfig({ ...connectionConfig, [f.key]: e.target.value })
                          }
                          className="input-desktop w-full"
                        />
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Host', key: 'host', placeholder: 'localhost', type: 'text' },
                        { label: 'Port', key: 'port', placeholder: '5432', type: 'number' },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1">
                            {f.label}
                          </label>
                          <input
                            type={f.type}
                            placeholder={f.placeholder}
                            value={(connectionConfig as any)[f.key]}
                            onChange={e =>
                              setConnectionConfig({
                                ...connectionConfig,
                                [f.key]:
                                  f.type === 'number' ? parseInt(e.target.value) : e.target.value,
                              })
                            }
                            className="input-desktop w-full"
                          />
                        </div>
                      ))}
                    </div>
                    {[
                      { label: 'Database', key: 'database', placeholder: 'mydb', type: 'text' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1">
                          {f.label}
                        </label>
                        <input
                          type={f.type}
                          placeholder={f.placeholder}
                          value={(connectionConfig as any)[f.key]}
                          onChange={e =>
                            setConnectionConfig({ ...connectionConfig, [f.key]: e.target.value })
                          }
                          className="input-desktop w-full"
                        />
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Username', key: 'username', placeholder: 'user', type: 'text' },
                        {
                          label: 'Password',
                          key: 'password',
                          placeholder: '••••••••',
                          type: 'password',
                        },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="block text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1">
                            {f.label}
                          </label>
                          <input
                            type={f.type}
                            placeholder={f.placeholder}
                            value={(connectionConfig as any)[f.key]}
                            onChange={e =>
                              setConnectionConfig({ ...connectionConfig, [f.key]: e.target.value })
                            }
                            className="input-desktop w-full"
                          />
                        </div>
                      ))}
                    </div>

                    {/* MCP notice */}
                    <div className="flex items-start gap-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2.5">
                      <Zap className="w-3.5 h-3.5 text-white/40 mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] text-white/35 leading-relaxed">
                        This connection is available to AI via MCP for natural-language CRUD access.
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/[0.07]">
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        setAddError(null);
                      }}
                      className="h-7 px-3.5 rounded-[6px] text-[12px] font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveConnection}
                      disabled={!connectionConfig.name || isAdding}
                      className="h-7 px-3.5 rounded-[6px] text-[12px] font-medium bg-white text-black hover:bg-zinc-200 transition-all disabled:opacity-40 flex items-center gap-1.5"
                    >
                      {isAdding ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Adding…
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          Add Connection
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
      </AnimatePresence>
    </div>
  );
}
