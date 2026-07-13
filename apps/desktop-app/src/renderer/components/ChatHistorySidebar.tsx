import React, { useEffect, useState } from 'react';

interface ChatConversation {
  id: string;
  title: string;
  connectionId?: string;
  connectionName?: string;
  provider: string;
  model: string;
  messages: any[];
  totalTokens: number;
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
  pinned: boolean;
  archived: boolean;
}

interface ChatHistorySidebarProps {
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (conversationId: string) => void;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  selectedConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
}) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadConversations();
    loadStats();
  }, [showArchived]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const result = await window.electron.chat.getAllConversations({
        includeArchived: showArchived,
        limit: 50,
      });
      setConversations(result);
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await window.electron.chat.getStats();
      setStats(result);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await window.electron.chat.searchConversations(query);
        setConversations(results);
      } catch (err) {
        console.error('Error searching conversations:', err);
      }
    } else {
      loadConversations();
    }
  };

  const handleTogglePin = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await window.electron.chat.togglePin(conversationId);
      loadConversations();
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  const handleToggleArchive = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await window.electron.chat.toggleArchive(conversationId);
      loadConversations();
    } catch (err) {
      console.error('Error toggling archive:', err);
    }
  };

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      window.confirm('Are you sure you want to delete this conversation? This cannot be undone.')
    ) {
      try {
        await window.electron.chat.deleteConversation(conversationId);
        onDeleteConversation(conversationId);
        loadConversations();
        loadStats();
      } catch (err) {
        console.error('Error deleting conversation:', err);
      }
    }
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else if (days < 30) {
      return `${Math.floor(days / 7)} weeks ago`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  };

  const formatCost = (cost: number): string => {
    return `$${cost.toFixed(4)}`;
  };

  const getProviderColor = (provider: string): string => {
    const colors: Record<string, string> = {
      openai: 'text-zinc-400',
      anthropic: 'text-zinc-400',
      google: 'text-zinc-400',
      groq: 'text-zinc-400',
      mistral: 'text-zinc-400',
      cohere: 'text-zinc-400',
    };
    return colors[provider] || 'text-zinc-500';
  };

  const pinnedConversations = conversations.filter(c => c.pinned);
  const unpinnedConversations = conversations.filter(c => !c.pinned);

  return (
    <div className="h-full flex flex-col bg-[#0A0A0A]">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <button
          onClick={onNewChat}
          className="w-full px-4 py-3 bg-gradient-to-r from-zinc-400 to-zinc-600 hover:from-zinc-300 hover:to-zinc-700 text-white rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-white/5 hover:shadow-white/10 group relative overflow-hidden"
        >
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <svg className="w-5 h-5 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="relative">New Chat</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-white/5">
        <div className="relative group">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-500 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/10 focus:border-white/20 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600/40 transition-all"
          />
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-zinc-500 mb-0.5">Chats</div>
              <div className="font-medium text-white">{stats.totalConversations}</div>
            </div>
            <div className="text-center p-2 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-zinc-500 mb-0.5">Tokens</div>
              <div className="font-medium text-white">{(stats.totalTokens / 1000).toFixed(1)}K</div>
            </div>
            <div className="text-center p-2 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-zinc-500 mb-0.5">Cost</div>
              <div className="font-medium text-zinc-400">{formatCost(stats.totalCost)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="px-4 py-2.5 border-b border-white/5">
        <label className="flex items-center gap-2 text-sm text-zinc-500 cursor-pointer hover:text-zinc-400 transition-colors group">
          <div className="relative">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={e => setShowArchived(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-4 h-4 rounded border-2 border-zinc-700 peer-checked:border-zinc-700 peer-checked:bg-zinc-800 transition-all flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <span>Show archived</span>
        </label>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-700 border-t-blue-500"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-zinc-500 text-sm font-medium mb-1">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className="text-zinc-500 text-xs">
              {searchQuery ? 'Try a different search' : 'Start a new chat to begin'}
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {/* Pinned Conversations */}
            {pinnedConversations.length > 0 && (
              <>
                <div className="px-3 py-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                  Pinned
                </div>
                {pinnedConversations.map(conversation => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={conversation.id === selectedConversationId}
                    onSelect={() => onSelectConversation(conversation.id)}
                    onTogglePin={e => handleTogglePin(conversation.id, e)}
                    onToggleArchive={e => handleToggleArchive(conversation.id, e)}
                    onDelete={e => handleDelete(conversation.id, e)}
                    formatDate={formatDate}
                    formatCost={formatCost}
                    getProviderColor={getProviderColor}
                  />
                ))}
              </>
            )}

            {/* Unpinned Conversations */}
            {unpinnedConversations.length > 0 && (
              <>
                {pinnedConversations.length > 0 && (
                  <div className="px-3 py-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider mt-2">
                    Recent
                  </div>
                )}
                {unpinnedConversations.map(conversation => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={conversation.id === selectedConversationId}
                    onSelect={() => onSelectConversation(conversation.id)}
                    onTogglePin={e => handleTogglePin(conversation.id, e)}
                    onToggleArchive={e => handleToggleArchive(conversation.id, e)}
                    onDelete={e => handleDelete(conversation.id, e)}
                    formatDate={formatDate}
                    formatCost={formatCost}
                    getProviderColor={getProviderColor}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface ConversationItemProps {
  conversation: ChatConversation;
  isSelected: boolean;
  onSelect: () => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onToggleArchive: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  formatDate: (date: Date) => string;
  formatCost: (cost: number) => string;
  getProviderColor: (provider: string) => string;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onSelect,
  onTogglePin,
  onToggleArchive,
  onDelete,
  formatDate,
  formatCost,
  getProviderColor,
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`
        relative mx-2 mb-1.5 p-3 rounded-xl cursor-pointer transition-all duration-200 group
        ${
          isSelected
            ? 'bg-gradient-to-r from-white/10 to-white/10 border border-zinc-700/40 shadow-lg shadow-white/5'
            : 'bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10'
        }
        ${conversation.archived ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {conversation.pinned && (
              <svg
                className="w-3 h-3 text-zinc-400 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78.098 1.624.799 1.959.108.05.217.094.33.132L6 18.5v-2.58l-1-3.13z" />
              </svg>
            )}
            <h4 className="text-sm font-medium text-white truncate group-hover:text-zinc-400 transition-colors">
              {conversation.title}
            </h4>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1.5">
            <span className={`${getProviderColor(conversation.provider)} font-medium`}>
              {conversation.provider}
            </span>
            <span>•</span>
            <span className="truncate">{conversation.model}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span>{formatDate(conversation.updatedAt)}</span>
            <span>{conversation.messages.length} msgs</span>
            {conversation.totalCost > 0 && (
              <span className="text-zinc-400 font-medium">
                {formatCost(conversation.totalCost)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div
            className="flex items-center gap-0.5 animate-in fade-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onTogglePin}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title={conversation.pinned ? 'Unpin' : 'Pin'}
            >
              {conversation.pinned ? (
                <svg className="w-3.5 h-3.5 text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78.098 1.624.799 1.959.108.05.217.094.33.132L6 18.5v-2.58l-1-3.13z" />
                </svg>
              ) : (
                <svg
                  className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-500"
                  fill="none"
                  viewBox="0 0 20 20"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h6a2 2 0 012 2v14l-5-3-5 3V5z"
                  />
                </svg>
              )}
            </button>
            <button
              onClick={onToggleArchive}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title={conversation.archived ? 'Unarchive' : 'Archive'}
            >
              <svg
                className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group/delete"
              title="Delete"
            >
              <svg
                className="w-3.5 h-3.5 text-zinc-500 group-hover/delete:text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistorySidebar;
