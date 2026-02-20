/**
 * Context Manager Component
 * 
 * UI for managing LLM contexts stored locally
 */

import React, { useState, useEffect } from 'react';
import { 
 useContexts, 
 LLMContext, 
 ContextType,
 ContextStats,
} from '../hooks/useContexts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

// Icons as simple SVG components
const PlusIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
 <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
 </svg>
);

const TrashIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
 <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
 </svg>
);

const PencilIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
 <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
 </svg>
);

const DocumentIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
 <path d="M3 3.5A1.5 1.5 0 014.5 2h6.879a1.5 1.5 0 011.06.44l4.122 4.12A1.5 1.5 0 0117 7.622V16.5a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 16.5v-13z" />
 </svg>
);

const DatabaseIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
 <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 014.5 2h11A1.5 1.5 0 0117 3.5v5.75a.75.75 0 01-1.5 0V3.5H4.5v13h11V14a.75.75 0 011.5 0v2.5a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 16.5v-13z" clipRule="evenodd" />
 <path d="M7 7.75a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 017 7.75zm.75 2.25a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" />
 </svg>
);

const ChatIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
 <path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0110 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.102 41.102 0 01-3.55.414c-.28.02-.521.18-.643.413l-1.712 3.293a.75.75 0 01-1.33 0l-1.713-3.293a.783.783 0 00-.642-.413 41.108 41.108 0 01-3.55-.414C1.993 13.245 1 11.986 1 10.574V5.426c0-1.413.993-2.67 2.43-2.902z" clipRule="evenodd" />
 </svg>
);

const BookIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
 <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
 </svg>
);

// Type label and color map
const TYPE_CONFIG: Record<ContextType, { label: string; color: string; icon: React.FC }> = {
 system_prompt: { label: 'System Prompt', color: 'bg-purple-900 text-purple-200', icon: ChatIcon },
 database_schema: { label: 'Database Schema', color: 'bg-blue-900 text-blue-200', icon: DatabaseIcon },
 knowledge_base: { label: 'Knowledge', color: 'bg-green-900 text-green-200', icon: BookIcon },
 memory_summary: { label: 'Memory', color: 'bg-yellow-900 text-yellow-200', icon: ChatIcon },
 project: { label: 'Project', color: 'bg-orange-900 text-orange-200', icon: DocumentIcon },
 template: { label: 'Template', color: 'bg-gray-800 text-gray-200', icon: DocumentIcon },
};

// Context Card Component
function ContextCard({ 
 context, 
 onEdit, 
 onDelete, 
 onToggleActive,
 onToggleAutoInclude,
}: { 
 context: LLMContext; 
 onEdit: (ctx: LLMContext) => void;
 onDelete: (id: string) => void;
 onToggleActive: (id: string) => void;
 onToggleAutoInclude: (id: string) => void;
}) {
 const config = TYPE_CONFIG[context.type];
 const Icon = config.icon;
 
 return (
 <Card className={`relative ${!context.isActive ? 'opacity-60' : ''}`}>
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-2">
 <div className={`p-1.5 rounded ${config.color}`}>
 <Icon />
 </div>
 <div>
 <CardTitle className="text-base">{context.name}</CardTitle>
 <CardDescription className="text-xs">
 {context.tokenCount.toLocaleString()} tokens • 
 Used {context.usageCount} times
 </CardDescription>
 </div>
 </div>
 <div className="flex items-center gap-1">
 <Button 
 variant="ghost" 
 size="sm"
 onClick={() => onEdit(context)}
 className="h-8 w-8 p-0"
 >
 <PencilIcon />
 </Button>
 <Button 
 variant="ghost" 
 size="sm"
 onClick={() => onDelete(context.id)}
 className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
 >
 <TrashIcon />
 </Button>
 </div>
 </div>
 </CardHeader>
 <CardContent className="pb-4">
 <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
 {context.description || context.content.slice(0, 150)}
 </p>
 
 <div className="flex flex-wrap gap-1 mb-3">
 <Badge className={config.color}>{config.label}</Badge>
 {context.tags.map(tag => (
 <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
 ))}
 </div>
 
 <div className="flex items-center gap-3 text-sm">
 <label className="flex items-center gap-2 cursor-pointer">
 <input 
 type="checkbox" 
 checked={context.isActive}
 onChange={() => onToggleActive(context.id)}
 className="rounded border-border"
 />
 <span className="text-muted-foreground">Active</span>
 </label>
 <label className="flex items-center gap-2 cursor-pointer">
 <input 
 type="checkbox" 
 checked={context.autoInclude}
 onChange={() => onToggleAutoInclude(context.id)}
 className="rounded border-border"
 />
 <span className="text-muted-foreground">Auto-include</span>
 </label>
 </div>
 </CardContent>
 </Card>
 );
}

// Context Editor Modal
function ContextEditor({
 context,
 onSave,
 onClose,
}: {
 context: LLMContext | null;
 onSave: (data: any) => Promise<void>;
 onClose: () => void;
}) {
 const [name, setName] = useState(context?.name || '');
 const [type, setType] = useState<ContextType>(context?.type || 'system_prompt');
 const [content, setContent] = useState(context?.content || '');
 const [description, setDescription] = useState(context?.description || '');
 const [tags, setTags] = useState(context?.tags.join(', ') || '');
 const [priority, setPriority] = useState(context?.priority || 50);
 const [autoInclude, setAutoInclude] = useState(context?.autoInclude || false);
 const [saving, setSaving] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setSaving(true);
 try {
 await onSave({
 name,
 type,
 content,
 description,
 tags: tags.split(',').map(t => t.trim()).filter(Boolean),
 priority,
 autoInclude,
 });
 onClose();
 } catch (err) {
 console.error('Failed to save context:', err);
 } finally {
 setSaving(false);
 }
 };

 return (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
 <div className="bg-background border rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
 <form onSubmit={handleSubmit}>
 <div className="p-6 border-b">
 <h2 className="text-xl font-medium">
 {context ? 'Edit Context' : 'New Context'}
 </h2>
 </div>
 
 <div className="p-6 space-y-4">
 <div>
 <label className="block text-sm font-medium mb-1.5">Name</label>
 <Input 
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder="e.g., SQL Expert, Project Guidelines..."
 required
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium mb-1.5">Type</label>
 <select
 value={type}
 onChange={(e) => setType(e.target.value as ContextType)}
 className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
 >
 {Object.entries(TYPE_CONFIG).map(([key, config]) => (
 <option key={key} value={key}>{config.label}</option>
 ))}
 </select>
 </div>
 
 <div>
 <label className="block text-sm font-medium mb-1.5">Description</label>
 <Input 
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 placeholder="Brief description of this context..."
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium mb-1.5">Content</label>
 <textarea
 value={content}
 onChange={(e) => setContent(e.target.value)}
 placeholder="Enter the context content..."
 rows={10}
 className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono resize-y"
 required
 />
 <p className="text-xs text-muted-foreground mt-1">
 ~{Math.ceil(content.length / 4).toLocaleString()} tokens
 </p>
 </div>
 
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium mb-1.5">Tags</label>
 <Input 
 value={tags}
 onChange={(e) => setTags(e.target.value)}
 placeholder="sql, analysis, coding..."
 />
 <p className="text-xs text-muted-foreground mt-1">
 Comma-separated
 </p>
 </div>
 
 <div>
 <label className="block text-sm font-medium mb-1.5">Priority</label>
 <Input 
 type="number"
 min={1}
 max={100}
 value={priority}
 onChange={(e) => setPriority(Number(e.target.value))}
 />
 <p className="text-xs text-muted-foreground mt-1">
 Higher = included first
 </p>
 </div>
 </div>
 
 <label className="flex items-center gap-2 cursor-pointer">
 <input 
 type="checkbox" 
 checked={autoInclude}
 onChange={(e) => setAutoInclude(e.target.checked)}
 className="rounded border-border"
 />
 <span className="text-sm">Auto-include in all conversations</span>
 </label>
 </div>
 
 <div className="p-6 border-t flex justify-end gap-3">
 <Button type="button" variant="ghost" onClick={onClose}>
 Cancel
 </Button>
 <Button type="submit" disabled={saving}>
 {saving ? 'Saving...' : context ? 'Save Changes' : 'Create Context'}
 </Button>
 </div>
 </form>
 </div>
 </div>
 );
}

// Stats Card
function StatsCard({ stats }: { stats: ContextStats }) {
 return (
 <div className="grid grid-cols-4 gap-4 mb-6">
 <Card>
 <CardContent className="p-4 text-center">
 <div className="text-2xl font-medium">{stats.totalContexts}</div>
 <div className="text-sm text-muted-foreground">Total Contexts</div>
 </CardContent>
 </Card>
 <Card>
 <CardContent className="p-4 text-center">
 <div className="text-2xl font-medium">{stats.totalTokens.toLocaleString()}</div>
 <div className="text-sm text-muted-foreground">Total Tokens</div>
 </CardContent>
 </Card>
 <Card>
 <CardContent className="p-4 text-center">
 <div className="text-2xl font-medium">{stats.byType.system_prompt || 0}</div>
 <div className="text-sm text-muted-foreground">System Prompts</div>
 </CardContent>
 </Card>
 <Card>
 <CardContent className="p-4 text-center">
 <div className="text-2xl font-medium">{stats.byType.knowledge_base || 0}</div>
 <div className="text-sm text-muted-foreground">Knowledge Docs</div>
 </CardContent>
 </Card>
 </div>
 );
}

// Main Context Manager Component
export default function ContextManager() {
 const {
 contexts,
 loading,
 error,
 stats,
 createContext,
 updateContext,
 deleteContext,
 toggleActive,
 toggleAutoInclude,
 importKnowledgeFile,
 loadStats,
 exportAllContexts,
 importContextsFromJson,
 } = useContexts();

 const [editingContext, setEditingContext] = useState<LLMContext | null>(null);
 const [showEditor, setShowEditor] = useState(false);
 const [filterType, setFilterType] = useState<ContextType | 'all'>('all');
 const [searchQuery, setSearchQuery] = useState('');

 useEffect(() => {
 loadStats();
 }, [loadStats, contexts]);

 // Check if context API is available
 if (error && error.includes('not available')) {
 return (
 <div className="p-6">
 <Card>
 <CardContent className="p-12 text-center">
 <div className="text-4xl mb-4">⚠️</div>
 <h3 className="text-lg font-medium mb-2">Context API Not Available</h3>
 <p className="text-muted-foreground mb-4">
 The context management system is not yet initialized. Please restart the application.
 </p>
 <Button onClick={() => window.location.reload()}>
 Reload Application
 </Button>
 </CardContent>
 </Card>
 </div>
 );
 }

 const filteredContexts = contexts.filter(ctx => {
 if (filterType !== 'all' && ctx.type !== filterType) return false;
 if (searchQuery) {
 const q = searchQuery.toLowerCase();
 return (
 ctx.name.toLowerCase().includes(q) ||
 ctx.content.toLowerCase().includes(q) ||
 ctx.tags.some(t => t.toLowerCase().includes(q))
 );
 }
 return true;
 });

 const handleSave = async (data: any) => {
 if (editingContext) {
 await updateContext(editingContext.id, data);
 } else {
 await createContext(data);
 }
 };

 const handleDelete = async (id: string) => {
 if (confirm('Are you sure you want to delete this context?')) {
 await deleteContext(id);
 }
 };

 const handleImportFile = async () => {
 const result = await importKnowledgeFile();
 if (!result.canceled) {
 alert(`Imported ${result.contexts.length} context(s)`);
 }
 };

 const handleExport = async () => {
 const result = await exportAllContexts();
 if (result.success) {
 alert(`Exported to ${result.path}`);
 }
 };

 const handleImportJson = async () => {
 const result = await importContextsFromJson({ overwrite: false });
 if (!result.canceled) {
 alert(`Imported ${result.count} context(s)`);
 }
 };

 if (loading && contexts.length === 0) {
 return (
 <div className="flex items-center justify-center h-64">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
 </div>
 );
 }

 return (
 <div className="p-6">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h1 className="text-2xl font-medium">Context Manager</h1>
 <p className="text-muted-foreground">
 Manage your LLM contexts, system prompts, and knowledge base
 </p>
 </div>
 <div className="flex items-center gap-2">
 <Button variant="outline" onClick={handleImportFile}>
 <DocumentIcon />
 <span className="ml-2">Import File</span>
 </Button>
 <Button variant="outline" onClick={handleImportJson}>
 Import JSON
 </Button>
 <Button variant="outline" onClick={handleExport}>
 Export All
 </Button>
 <Button onClick={() => { setEditingContext(null); setShowEditor(true); }}>
 <PlusIcon />
 <span className="ml-2">New Context</span>
 </Button>
 </div>
 </div>

 {stats && <StatsCard stats={stats} />}

 {error && (
 <div className="bg-red-500/10 text-red-400 rounded-lg p-4 mb-6">
 {error}
 </div>
 )}

 <div className="flex items-center gap-4 mb-6">
 <Input
 placeholder="Search contexts..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="max-w-xs"
 />
 <select
 value={filterType}
 onChange={(e) => setFilterType(e.target.value as ContextType | 'all')}
 className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
 >
 <option value="all">All Types</option>
 {Object.entries(TYPE_CONFIG).map(([key, config]) => (
 <option key={key} value={key}>{config.label}</option>
 ))}
 </select>
 </div>

 {filteredContexts.length === 0 ? (
 <Card>
 <CardContent className="p-12 text-center">
 <div className="text-4xl mb-4">📚</div>
 <h3 className="text-lg font-medium mb-2">No contexts yet</h3>
 <p className="text-muted-foreground mb-4">
 Create system prompts, import knowledge files, or let AI generate context from your databases.
 </p>
 <Button onClick={() => { setEditingContext(null); setShowEditor(true); }}>
 <PlusIcon />
 <span className="ml-2">Create Your First Context</span>
 </Button>
 </CardContent>
 </Card>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {filteredContexts.map(ctx => (
 <ContextCard
 key={ctx.id}
 context={ctx}
 onEdit={(c) => { setEditingContext(c); setShowEditor(true); }}
 onDelete={handleDelete}
 onToggleActive={toggleActive}
 onToggleAutoInclude={toggleAutoInclude}
 />
 ))}
 </div>
 )}

 {showEditor && (
 <ContextEditor
 context={editingContext}
 onSave={handleSave}
 onClose={() => { setShowEditor(false); setEditingContext(null); }}
 />
 )}
 </div>
 );
}
