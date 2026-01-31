import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, Loader2, Bot, User, Plus, Trash2, Copy, Check,
  MessageSquare, ChevronDown, PanelLeftClose, PanelLeft, Search,
  Clock, Pencil, Lightbulb, Code, Briefcase, Sparkles, Paperclip, X, FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  tokens?: { input: number; output: number };
  cost?: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  pinned?: boolean;
  archived?: boolean;
}

// Comprehensive LLM models with SVG icons (Latest January 2026)
const LLM_MODELS = [
  // OpenAI Models - Latest GPT-5 Series & Reasoning Models
  { id: 'gpt-5.2', name: 'GPT-5.2', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  { id: 'gpt-5.2-pro', name: 'GPT-5.2 Pro', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  { id: 'gpt-5', name: 'GPT-5', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  { id: 'o4-mini', name: 'o4 Mini', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  { id: 'o3', name: 'o3', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  { id: 'o3-mini', name: 'o3 Mini', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  { id: 'o1', name: 'o1', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  { id: 'o1-mini', name: 'o1 Mini', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  
  // Anthropic Models
  { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', provider: 'Anthropic', icon: '/claude-ai.svg', hasIcon: true },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', icon: '/claude-ai.svg', hasIcon: true },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'Anthropic', icon: '/claude-ai.svg', hasIcon: true },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'Anthropic', icon: '/claude-ai.svg', hasIcon: true },
  
  // Google Gemini Models
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', provider: 'Google', icon: '/gemini-color.svg', hasIcon: true },
  { id: 'gemini-2.0-flash-thinking-exp-01-21', name: 'Gemini 2.0 Flash Thinking', provider: 'Google', icon: '/gemini-color.svg', hasIcon: true },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', icon: '/gemini-color.svg', hasIcon: true },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', icon: '/gemini-color.svg', hasIcon: true },
  
  // Meta Llama Models
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', provider: 'Meta', icon: '/meta.svg', hasIcon: true, needsInvert: true },
  { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B Versatile', provider: 'Meta', icon: '/meta.svg', hasIcon: true, needsInvert: true },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', provider: 'Meta', icon: '/meta.svg', hasIcon: true, needsInvert: true },
  { id: 'llama-3.2-90b-vision-preview', name: 'Llama 3.2 90B Vision', provider: 'Meta', icon: '/meta.svg', hasIcon: true, needsInvert: true },
  { id: 'llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick 17B', provider: 'Meta', icon: '/meta.svg', hasIcon: true, needsInvert: true },
  { id: 'llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B', provider: 'Meta', icon: '/meta.svg', hasIcon: true, needsInvert: true },
  
  // xAI Grok Models
  { id: 'grok-2-1212', name: 'Grok 2', provider: 'xAI', icon: '/grok.svg', hasIcon: true, needsInvert: true },
  { id: 'grok-2-vision-1212', name: 'Grok 2 Vision', provider: 'xAI', icon: '/grok.svg', hasIcon: true, needsInvert: true },
  { id: 'grok-beta', name: 'Grok Beta', provider: 'xAI', icon: '/grok.svg', hasIcon: true, needsInvert: true },
  
  // Groq-Specific Models (Fast Inference via LPU)
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', provider: 'Groq', icon: '/groq.svg', hasIcon: true },
  { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', provider: 'Groq', icon: '/groq.svg', hasIcon: true },
  { id: 'groq/compound', name: 'Groq Compound', provider: 'Groq', icon: '/groq.svg', hasIcon: true },
  { id: 'groq/compound-mini', name: 'Groq Compound Mini', provider: 'Groq', icon: '/groq.svg', hasIcon: true },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'Groq', icon: '/groq.svg', hasIcon: true },
  
  // Mistral AI Models
  { id: 'mistral-large-latest', name: 'Mistral Large', provider: 'Mistral', icon: '/mistral-rainbow.svg', hasIcon: true },
  { id: 'mistral-medium-latest', name: 'Mistral Medium', provider: 'Mistral', icon: '/mistral-rainbow.svg', hasIcon: true },
  { id: 'mistral-small-latest', name: 'Mistral Small', provider: 'Mistral', icon: '/mistral-rainbow.svg', hasIcon: true },
  
  // DeepSeek Models
  { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek', icon: '/deepseek-color.svg', hasIcon: true },
  { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', provider: 'DeepSeek', icon: '/deepseek-color.svg', hasIcon: true },
  
  // Additional Groq Models
  { id: 'qwen/qwen3-32b', name: 'Qwen3 32B', provider: 'Alibaba', logo: '🔷', hasIcon: false },
  { id: 'moonshotai/kimi-k2-instruct-0905', name: 'Kimi K2', provider: 'Moonshot', logo: '🌙', hasIcon: false },
];

// Quick action prompts like Claude
const QUICK_ACTIONS = [
  { icon: Pencil, label: 'Write', prompt: 'Help me write', color: 'hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/30' },
  { icon: Lightbulb, label: 'Learn', prompt: 'Explain to me', color: 'hover:bg-yellow-500/10 hover:text-yellow-500 hover:border-yellow-500/30' },
  { icon: Code, label: 'Code', prompt: 'Help me code', color: 'hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/30' },
  { icon: Briefcase, label: 'Work', prompt: 'Help me with work', color: 'hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/30' },
  { icon: Sparkles, label: 'AI\'s choice', prompt: 'Surprise me with something interesting', color: 'hover:bg-purple-500/10 hover:text-purple-500 hover:border-purple-500/30' },
];

export default function ModernChatPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [selectedConnection, setSelectedConnection] = useState('');
  const [connections, setConnections] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; content: string; type: string }[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  // Get first name
  const getFirstName = () => {
    if (!user?.name) return 'there';
    return user.name.split(' ')[0];
  };

  useEffect(() => {
    loadConnections();
    loadSessions();
    
    // Check if there's a pre-selected connection from navigation
    const state = location.state as { selectedConnection?: string } | null;
    if (state?.selectedConnection) {
      setSelectedConnection(state.selectedConnection);
    }
  }, [location.state]);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConnections = async () => {
    try {
      // Try to get connections from MCP first (local), fall back to Express API
      const conns = await window.electron.mcp?.getAllConnections?.() 
        || await window.electron.express?.getUserConnections?.()
        || [];
      const result = conns as any;
      setConnections(Array.isArray(result) ? result : result?.data || []);
    } catch (error: any) {
      // Silently handle API key errors - user might not have backend configured yet
      if (!error?.message?.includes('Invalid API key')) {
        console.error('Failed to load connections:', error);
      }
      setConnections([]);
    }
  };

  const loadSessions = async () => {
    try {
      const chatSessions = await window.electron.chat?.getAllConversations?.() || [];
      const result = chatSessions as any;
      const sessionsArray = Array.isArray(result) ? result : result?.data || [];
      setSessions(sessionsArray.map((s: any) => ({
        id: s.id,
        title: s.title || 'Untitled',
        messages: (s.messages || []).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp || m.createdAt || Date.now())
        })),
        createdAt: new Date(s.createdAt || Date.now()),
        updatedAt: new Date(s.updatedAt || Date.now()),
        pinned: s.pinned,
        archived: s.archived
      })));
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setSessions([]);
    }
  };

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    setInput('');
    textareaRef.current?.focus();
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }
  }, [currentSession]);

  // File attachment handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: { name: string; content: string; type: string }[] = [];
    
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      try {
        const content = await file.text();
        newFiles.push({
          name: file.name,
          content,
          type: file.type || 'text/plain',
        });
      } catch (error) {
        console.error(`Failed to read file ${file.name}:`, error);
      }
    }

    setAttachedFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    // Build message content with file attachments
    let messageContent = input.trim();
    if (attachedFiles.length > 0) {
      const fileContents = attachedFiles.map(f => 
        `\n\n---\n📎 **File: ${f.name}**\n\`\`\`\n${f.content}\n\`\`\``
      ).join('');
      messageContent = messageContent + fileContents;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    // Clear attachments after sending
    setAttachedFiles([]);

    let session = currentSession;
    if (!session) {
      session = {
        id: `session-${Date.now()}`,
        title: input.trim().slice(0, 50),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setSessions(prev => [session!, ...prev]);
    }

    const updatedMessages = [...session.messages, userMessage];
    const updatedSession = {
      ...session,
      messages: updatedMessages,
      title: session.messages.length === 0 ? input.trim().slice(0, 50) : session.title,
      updatedAt: new Date(),
    };

    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === session!.id ? updatedSession : s));
    setInput('');
    setIsLoading(true);

    try {
      let response;
      
      if (selectedConnection) {
        const mcp = window.electron.mcp as any;
        if (mcp?.query) {
          const mcpResult = await mcp.query(selectedConnection, input.trim());
          response = mcpResult;
        } else {
          response = await window.electron.express?.queryAI?.({
            userId: 'local-user',
            licenseId: 'local',
            provider: selectedModel.includes('claude') ? 'anthropic' : selectedModel.includes('gpt') ? 'openai' : 'groq',
            model: selectedModel,
            messages: [{ role: 'user', content: `[Database: ${selectedConnection}] ${input.trim()}` }],
            connectionId: selectedConnection,
          });
        }
      } else {
        response = await window.electron.express?.queryAI?.({
          userId: 'local-user',
          licenseId: 'local',
          provider: selectedModel.includes('claude') ? 'anthropic' : selectedModel.includes('gpt') ? 'openai' : 'groq',
          model: selectedModel,
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        });
      }

      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response?.content || response?.message || response?.data?.content || 'No response received',
        timestamp: new Date(),
        model: selectedModel,
        tokens: response?.tokens || response?.usage,
        cost: response?.cost,
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, assistantMessage],
        updatedAt: new Date(),
      };

      setCurrentSession(finalSession);
      setSessions(prev => prev.map(s => s.id === session!.id ? finalSession : s));

      try {
        await window.electron.chat?.updateConversation?.(session.id, {
          title: finalSession.title,
          updatedAt: finalSession.updatedAt
        });
      } catch {
        // Ignore save errors
      }
      
    } catch (error: any) {
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `⚠️ Error: ${error.message || 'Failed to get response. Please check your API configuration.'}`,
        timestamp: new Date(),
      };

      const errorSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, errorMessage],
      };
      setCurrentSession(errorSession);
      setSessions(prev => prev.map(s => s.id === session!.id ? errorSession : s));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedModelInfo = LLM_MODELS.find(m => m.id === selectedModel) || LLM_MODELS[0];
  const hasMessages = currentSession && currentSession.messages.length > 0;

  return (
    <div className="flex h-full bg-white dark:bg-black text-gray-900 dark:text-white overflow-hidden">
      {/* History Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800"
          >
            {/* New Chat Button */}
            <div className="p-4">
              <Button
                onClick={createNewSession}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-xl h-11"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </div>

            {/* Search */}
            <div className="px-4 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Chat History List */}
            <div className="flex-1 overflow-y-auto px-3">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                  {searchQuery ? 'No chats found' : 'No conversations yet'}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredSessions.map(session => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        'group relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors',
                        currentSession?.id === session.id
                          ? 'bg-blue-50 dark:bg-gray-800'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
                      )}
                      onClick={() => setCurrentSession(session)}
                    >
                      <MessageSquare className="w-4 h-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate text-gray-900 dark:text-gray-100">{session.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {session.messages.length} messages
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 h-7 w-7 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Collapse Button */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-800">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setSidebarOpen(false)}
              >
                <PanelLeftClose className="w-4 h-4 mr-2" />
                Close Sidebar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 h-8 w-8"
                onClick={() => setSidebarOpen(true)}
              >
                <PanelLeft className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 h-8 w-8"
              onClick={createNewSession}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Center - Can show connection if selected */}
          {selectedConnection && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Connected to {connections.find(c => c.id === selectedConnection)?.name}
            </div>
          )}

          <div className="w-20" /> {/* Spacer for balance */}
        </div>

        {/* Messages Area or Welcome Screen */}
        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            // Welcome Screen - Claude Style
            <div className="h-full flex flex-col items-center justify-center px-4 max-w-3xl mx-auto">
              {/* Greeting */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-semibold text-gray-900 dark:text-white mb-2">
                  {getGreeting()}, {getFirstName()}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">How can I help you today?</p>
              </div>

              {/* Input Box */}
              <div className="w-full max-w-2xl mb-6">
                {/* Attached Files Preview */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {attachedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg text-sm">
                        <FileText className="w-4 h-4" />
                        <span className="truncate max-w-[150px]">{file.name}</span>
                        <button 
                          onClick={() => removeAttachedFile(index)}
                          className="hover:text-blue-900 dark:hover:text-blue-100"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 transition-colors shadow-sm">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".txt,.md,.json,.js,.ts,.jsx,.tsx,.py,.sql,.csv,.xml,.yaml,.yml,.html,.css,.sh,.env,.log"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything..."
                    className="w-full bg-transparent resize-none px-5 py-4 pr-28 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none min-h-[56px] max-h-[200px]"
                    rows={1}
                    disabled={isLoading}
                  />
                  
                  {/* Bottom row inside input */}
                  <div className="flex items-center justify-between px-4 pb-3">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach files"
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <Clock className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Model Selector */}
                      <div className="relative" ref={modelDropdownRef}>
                        <button
                          onClick={() => setShowModelDropdown(!showModelDropdown)}
                          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                        >
                          {selectedModelInfo.hasIcon ? (
                            <img src={selectedModelInfo.icon} alt={selectedModelInfo.name} className="w-4 h-4" />
                          ) : (
                            <span className="text-base">{selectedModelInfo.logo}</span>
                          )}
                          {selectedModelInfo.name}
                          <ChevronDown className={cn(
                            "w-3.5 h-3.5 transition-transform",
                            showModelDropdown && "rotate-180"
                          )} />
                        </button>
                        
                        <AnimatePresence>
                          {showModelDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 w-64"
                            >
                              <div className="py-2 max-h-[400px] overflow-y-auto">
                                {LLM_MODELS.map(model => (
                                  <button
                                    key={model.id}
                                    onClick={() => {
                                      setSelectedModel(model.id);
                                      setShowModelDropdown(false);
                                    }}
                                    className={cn(
                                      "w-full px-4 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-3",
                                      selectedModel === model.id && "bg-blue-50 dark:bg-gray-800"
                                    )}
                                  >
                                    {model.hasIcon ? (
                                      <img 
                                        src={model.icon} 
                                        alt={model.name} 
                                        className={cn(
                                          "w-5 h-5 flex-shrink-0",
                                          (model as any).needsInvert && "dark:invert"
                                        )} 
                                      />
                                    ) : (
                                      <span className="text-base flex-shrink-0">{model.logo}</span>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm text-gray-900 dark:text-gray-100">{model.name}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">{model.provider}</div>
                                    </div>
                                    {selectedModel === model.id && (
                                      <Check className="w-4 h-4 text-blue-500" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      {/* Send Button */}
                      <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                          input.trim() 
                            ? "bg-blue-600 hover:bg-blue-700 text-white" 
                            : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                        )}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3 flex-wrap justify-center">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.prompt)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 transition-all hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                    )}
                  >
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Database Connection Selector */}
              {connections.length > 0 && (
                <div className="mt-8">
                  <select
                    value={selectedConnection}
                    onChange={(e) => setSelectedConnection(e.target.value)}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">💬 Chat Mode (No Database)</option>
                    {connections.map(conn => (
                      <option key={conn.id} value={conn.id}>
                        🗄️ {conn.name} ({conn.type || conn.connection_type})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : (
            // Chat Messages
            <div className="max-w-3xl mx-auto py-8 px-6 space-y-6">
              <AnimatePresence>
                {currentSession.messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={cn(
                      'flex gap-4',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {/* Assistant Avatar */}
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Message Content */}
                    <div className={cn(
                      'max-w-[80%]',
                      message.role === 'user' ? 'order-1' : ''
                    )}>
                      <div className={cn(
                        'rounded-2xl px-4 py-3',
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      )}>
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm prose-invert max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code({ inline, className, children, ...props }: any) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  return !inline && match ? (
                                    <div className="relative my-4">
                                      <div className="flex items-center justify-between bg-gray-900 dark:bg-black px-4 py-2 rounded-t-lg border-b border-gray-700 dark:border-gray-800">
                                        <span className="text-xs text-gray-400 font-mono">{match[1]}</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 px-2 text-gray-400 hover:text-gray-200"
                                          onClick={() => copyToClipboard(String(children), message.id)}
                                        >
                                          {copiedId === message.id ? (
                                            <Check className="w-3 h-3" />
                                          ) : (
                                            <Copy className="w-3 h-3" />
                                          )}
                                        </Button>
                                      </div>
                                      <SyntaxHighlighter
                                        style={oneDark}
                                        language={match[1]}
                                        PreTag="div"
                                        customStyle={{
                                          margin: 0,
                                          borderRadius: '0 0 8px 8px',
                                          background: '#1a1a1a',
                                        }}
                                        {...props}
                                      >
                                        {String(children).replace(/\n$/, '')}
                                      </SyntaxHighlighter>
                                    </div>
                                  ) : (
                                    <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm" {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 px-1">
                        <span className="text-xs text-gray-400 dark:text-gray-500">{formatTime(message.timestamp)}</span>
                        {message.model && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">• {LLM_MODELS.find(m => m.id === message.model)?.name || message.model}</span>
                        )}
                      </div>
                    </div>

                    {/* User Avatar */}
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 order-2">
                        {user?.image ? (
                          <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - Only shown when in conversation */}
        {hasMessages && (
          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="max-w-3xl mx-auto">
              {/* Attached Files Preview */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg text-sm">
                      <FileText className="w-4 h-4" />
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <button 
                        onClick={() => removeAttachedFile(index)}
                        className="hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 transition-colors shadow-sm">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Reply to AI Nexus..."
                  className="w-full bg-transparent resize-none px-5 py-4 pr-20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none min-h-[56px] max-h-[200px]"
                  rows={1}
                  disabled={isLoading}
                />
                
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  {/* Attach file button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach files"
                    className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  {/* Model indicator */}
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">{selectedModelInfo.name}</span>
                  
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                      input.trim() 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
                Press Enter to send • Shift+Enter for new line
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
