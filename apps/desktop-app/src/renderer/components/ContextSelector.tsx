/**
 * Context Selector Component
 * 
 * Dropdown/popover for selecting contexts to include in a conversation
 */

import { useState, useEffect } from 'react';
import { useContexts, LLMContext, ContextType } from '../hooks/useContexts';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

// Icons
const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M3.25 3A2.25 2.25 0 001 5.25v9.5A2.25 2.25 0 003.25 17h13.5A2.25 2.25 0 0019 14.75v-9.5A2.25 2.25 0 0016.75 3H3.25zm.943 8.752a.75.75 0 01.055-1.06L6.128 9l-1.88-1.693a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 01-1.06-.055zM9.75 10.25a.75.75 0 000 1.5h2.5a.75.75 0 000-1.5h-2.5z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
  </svg>
);

// Type colors
const TYPE_COLORS: Record<ContextType, string> = {
  system_prompt: 'bg-purple-500',
  database_schema: 'bg-blue-500',
  knowledge_base: 'bg-green-500',
  memory_summary: 'bg-yellow-500',
  project: 'bg-orange-500',
  template: 'bg-gray-500',
};

interface ContextSelectorProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  connectionId?: string;
  projectId?: string;
  showAutoIncluded?: boolean;
  compact?: boolean;
}

export default function ContextSelector({
  selectedIds,
  onSelectionChange,
  connectionId,
  projectId,
  showAutoIncluded = true,
  compact = false,
}: ContextSelectorProps) {
  const { contexts } = useContexts({ isActive: true });
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get auto-included contexts
  const autoIncludedContexts = contexts.filter(c => c.autoInclude);
  
  // Get connection-specific contexts
  const connectionContexts = connectionId 
    ? contexts.filter(c => c.connectionId === connectionId && !c.autoInclude)
    : [];
  
  // Get project-specific contexts
  const projectContexts = projectId
    ? contexts.filter(c => c.projectId === projectId && !c.autoInclude)
    : [];
  
  // Get other selectable contexts
  const selectableContexts = contexts.filter(c => 
    !c.autoInclude && 
    c.connectionId !== connectionId && 
    c.projectId !== projectId
  );

  // Filter by search
  const filteredContexts = searchQuery
    ? selectableContexts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : selectableContexts;

  // Toggle context selection
  const toggleContext = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  // Calculate total tokens
  const totalTokens = [
    ...autoIncludedContexts,
    ...connectionContexts,
    ...projectContexts,
    ...contexts.filter(c => selectedIds.includes(c.id)),
  ].reduce((sum, c) => sum + c.tokenCount, 0);

  // Count of all active contexts
  const activeCount = autoIncludedContexts.length + 
    connectionContexts.length + 
    projectContexts.length + 
    selectedIds.length;

  if (compact) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2"
        >
          <BrainIcon />
          <span>{activeCount} contexts</span>
          <span className="text-muted-foreground">({totalTokens.toLocaleString()} tokens)</span>
          <ChevronDownIcon />
        </Button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-80 bg-background border rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
            <ContextList
              autoIncludedContexts={autoIncludedContexts}
              connectionContexts={connectionContexts}
              projectContexts={projectContexts}
              selectableContexts={filteredContexts}
              selectedIds={selectedIds}
              toggleContext={toggleContext}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showAutoIncluded={showAutoIncluded}
              onClose={() => setIsOpen(false)}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium flex items-center gap-2">
          <BrainIcon />
          Active Contexts
        </h3>
        <span className="text-sm text-muted-foreground">
          {totalTokens.toLocaleString()} tokens
        </span>
      </div>
      
      <ContextList
        autoIncludedContexts={autoIncludedContexts}
        connectionContexts={connectionContexts}
        projectContexts={projectContexts}
        selectableContexts={filteredContexts}
        selectedIds={selectedIds}
        toggleContext={toggleContext}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showAutoIncluded={showAutoIncluded}
      />
    </div>
  );
}

// Context List Component
function ContextList({
  autoIncludedContexts,
  connectionContexts,
  projectContexts,
  selectableContexts,
  selectedIds,
  toggleContext,
  searchQuery,
  setSearchQuery,
  showAutoIncluded,
  onClose,
}: {
  autoIncludedContexts: LLMContext[];
  connectionContexts: LLMContext[];
  projectContexts: LLMContext[];
  selectableContexts: LLMContext[];
  selectedIds: string[];
  toggleContext: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showAutoIncluded: boolean;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col max-h-96">
      {/* Search */}
      <div className="p-2 border-b">
        <input
          type="text"
          placeholder="Search contexts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border rounded-md bg-background"
        />
      </div>
      
      <div className="overflow-y-auto flex-1">
        {/* Auto-included contexts */}
        {showAutoIncluded && autoIncludedContexts.length > 0 && (
          <div className="p-2 border-b">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Auto-included
            </div>
            {autoIncludedContexts.map(ctx => (
              <ContextItem 
                key={ctx.id} 
                context={ctx} 
                locked 
              />
            ))}
          </div>
        )}
        
        {/* Connection contexts */}
        {connectionContexts.length > 0 && (
          <div className="p-2 border-b">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Database Schema
            </div>
            {connectionContexts.map(ctx => (
              <ContextItem 
                key={ctx.id} 
                context={ctx} 
                locked 
              />
            ))}
          </div>
        )}
        
        {/* Project contexts */}
        {projectContexts.length > 0 && (
          <div className="p-2 border-b">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Project Context
            </div>
            {projectContexts.map(ctx => (
              <ContextItem 
                key={ctx.id} 
                context={ctx} 
                locked 
              />
            ))}
          </div>
        )}
        
        {/* Selectable contexts */}
        {selectableContexts.length > 0 && (
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Available Contexts
            </div>
            {selectableContexts.map(ctx => (
              <ContextItem
                key={ctx.id}
                context={ctx}
                selected={selectedIds.includes(ctx.id)}
                onClick={() => toggleContext(ctx.id)}
              />
            ))}
          </div>
        )}
        
        {selectableContexts.length === 0 && autoIncludedContexts.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No contexts available
          </div>
        )}
      </div>
      
      {onClose && (
        <div className="p-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      )}
    </div>
  );
}

// Context Item Component
function ContextItem({
  context,
  selected,
  locked,
  onClick,
}: {
  context: LLMContext;
  selected?: boolean;
  locked?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={`
        flex items-center gap-2 p-2 rounded-md text-sm
        ${onClick ? 'cursor-pointer hover:bg-muted' : ''}
        ${selected ? 'bg-muted' : ''}
      `}
      onClick={onClick}
    >
      {/* Type indicator */}
      <div className={`w-2 h-2 rounded-full ${TYPE_COLORS[context.type]}`} />
      
      {/* Name and tokens */}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{context.name}</div>
        <div className="text-xs text-muted-foreground">
          {context.tokenCount.toLocaleString()} tokens
        </div>
      </div>
      
      {/* Selection state */}
      {locked ? (
        <Badge variant="outline" className="text-xs">Auto</Badge>
      ) : selected ? (
        <div className="text-green-500">
          <CheckIcon />
        </div>
      ) : null}
    </div>
  );
}

/**
 * Hook to get compiled context for AI queries
 */
export function useCompiledContextForChat(options: {
  model: string;
  connectionId?: string;
  projectId?: string;
  additionalContextIds?: string[];
}) {
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [contextTokens, setContextTokens] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const compile = async () => {
      setLoading(true);
      try {
        // Get model-specific config
        const configs: Record<string, { maxTokens: number; reservedForResponse: number; reservedForConversation: number }> = {
          'gpt-4o': { maxTokens: 128000, reservedForResponse: 4096, reservedForConversation: 32000 },
          'gpt-4-turbo': { maxTokens: 128000, reservedForResponse: 4096, reservedForConversation: 32000 },
          'claude-3-5-sonnet': { maxTokens: 200000, reservedForResponse: 8192, reservedForConversation: 50000 },
          default: { maxTokens: 32000, reservedForResponse: 2048, reservedForConversation: 8000 },
        };
        
        const config = configs[options.model] || configs.default;
        
        const result = await window.electron.context.compile({
          config,
          connectionId: options.connectionId,
          projectId: options.projectId,
          additionalContextIds: options.additionalContextIds,
        });
        
        setSystemPrompt(result.systemPrompt);
        setContextTokens(result.totalTokens);
      } catch (err) {
        console.error('Failed to compile context:', err);
      } finally {
        setLoading(false);
      }
    };
    
    compile();
  }, [options.model, options.connectionId, options.projectId, options.additionalContextIds]);

  return {
    systemPrompt,
    contextTokens,
    loading,
  };
}
