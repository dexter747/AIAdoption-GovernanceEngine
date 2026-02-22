import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Loader2,
  Bot,
  User,
  Plus,
  Trash2,
  Copy,
  Check,
  MessageSquare,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  Search,
  Clock,
  Pencil,
  Lightbulb,
  Code,
  Briefcase,
  Sparkles,
  Paperclip,
  X,
  FileText,
  Database,
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
  {
    id: 'gpt-5.2-pro',
    name: 'GPT-5.2 Pro',
    provider: 'OpenAI',
    icon: '/openai.svg',
    hasIcon: true,
  },
  { id: 'gpt-5', name: 'GPT-5', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    provider: 'OpenAI',
    icon: '/openai.svg',
    hasIcon: true,
  },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    icon: '/openai.svg',
    hasIcon: true,
  },
  { id: 'o4-mini', name: 'o4 Mini', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  { id: 'o3', name: 'o3', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  { id: 'o3-mini', name: 'o3 Mini', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  { id: 'o1', name: 'o1', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },
  { id: 'o1-mini', name: 'o1 Mini', provider: 'OpenAI', icon: '/openai.svg', hasIcon: true },

  // Anthropic Models
  {
    id: 'claude-3-7-sonnet-20250219',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    icon: '/claude-ai.svg',
    hasIcon: true,
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    icon: '/claude-ai.svg',
    hasIcon: true,
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    icon: '/claude-ai.svg',
    hasIcon: true,
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    icon: '/claude-ai.svg',
    hasIcon: true,
  },

  // Google Gemini Models
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    icon: '/gemini-color.svg',
    hasIcon: true,
  },
  {
    id: 'gemini-2.0-flash-thinking-exp-01-21',
    name: 'Gemini 2.0 Flash Thinking',
    provider: 'Google',
    icon: '/gemini-color.svg',
    hasIcon: true,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    icon: '/gemini-color.svg',
    hasIcon: true,
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    icon: '/gemini-color.svg',
    hasIcon: true,
  },

  // Meta Llama Models
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    provider: 'Meta',
    icon: '/meta.svg',
    hasIcon: true,
    needsInvert: true,
  },
  {
    id: 'llama-3.1-70b-versatile',
    name: 'Llama 3.1 70B Versatile',
    provider: 'Meta',
    icon: '/meta.svg',
    hasIcon: true,
    needsInvert: true,
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    provider: 'Meta',
    icon: '/meta.svg',
    hasIcon: true,
    needsInvert: true,
  },
  {
    id: 'llama-3.2-90b-vision-preview',
    name: 'Llama 3.2 90B Vision',
    provider: 'Meta',
    icon: '/meta.svg',
    hasIcon: true,
    needsInvert: true,
  },
  {
    id: 'llama-4-maverick-17b-128e-instruct',
    name: 'Llama 4 Maverick 17B',
    provider: 'Meta',
    icon: '/meta.svg',
    hasIcon: true,
    needsInvert: true,
  },
  {
    id: 'llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout 17B',
    provider: 'Meta',
    icon: '/meta.svg',
    hasIcon: true,
    needsInvert: true,
  },

  // xAI Grok Models
  {
    id: 'grok-2-1212',
    name: 'Grok 2',
    provider: 'xAI',
    icon: '/grok.svg',
    hasIcon: true,
    needsInvert: true,
  },
  {
    id: 'grok-2-vision-1212',
    name: 'Grok 2 Vision',
    provider: 'xAI',
    icon: '/grok.svg',
    hasIcon: true,
    needsInvert: true,
  },
  {
    id: 'grok-beta',
    name: 'Grok Beta',
    provider: 'xAI',
    icon: '/grok.svg',
    hasIcon: true,
    needsInvert: true,
  },

  // Groq-Specific Models (Fast Inference via LPU)
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT-OSS 120B',
    provider: 'Groq',
    icon: '/groq.svg',
    hasIcon: true,
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B',
    provider: 'Groq',
    icon: '/groq.svg',
    hasIcon: true,
  },
  {
    id: 'groq/compound',
    name: 'Groq Compound',
    provider: 'Groq',
    icon: '/groq.svg',
    hasIcon: true,
  },
  {
    id: 'groq/compound-mini',
    name: 'Groq Compound Mini',
    provider: 'Groq',
    icon: '/groq.svg',
    hasIcon: true,
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    provider: 'Groq',
    icon: '/groq.svg',
    hasIcon: true,
  },

  // Mistral AI Models
  {
    id: 'mistral-large-latest',
    name: 'Mistral Large',
    provider: 'Mistral',
    icon: '/mistral-rainbow.svg',
    hasIcon: true,
  },
  {
    id: 'mistral-medium-latest',
    name: 'Mistral Medium',
    provider: 'Mistral',
    icon: '/mistral-rainbow.svg',
    hasIcon: true,
  },
  {
    id: 'mistral-small-latest',
    name: 'Mistral Small',
    provider: 'Mistral',
    icon: '/mistral-rainbow.svg',
    hasIcon: true,
  },

  // DeepSeek Models
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'DeepSeek',
    icon: '/deepseek-color.svg',
    hasIcon: true,
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    provider: 'DeepSeek',
    icon: '/deepseek-color.svg',
    hasIcon: true,
  },

  // Additional Groq Models
  { id: 'qwen/qwen3-32b', name: 'Qwen3 32B', provider: 'Alibaba', logo: '🔷', hasIcon: false },
  {
    id: 'moonshotai/kimi-k2-instruct-0905',
    name: 'Kimi K2',
    provider: 'Moonshot',
    logo: '🌙',
    hasIcon: false,
  },
];

// Quick action prompts like Claude
const QUICK_ACTIONS = [
  {
    icon: Pencil,
    label: 'Write',
    prompt: 'Help me write',
    color: 'hover:bg-white/5 hover:text-zinc-400 hover:border-zinc-700/40',
  },
  {
    icon: Lightbulb,
    label: 'Learn',
    prompt: 'Explain to me',
    color: 'hover:bg-white/5 hover:text-zinc-400 hover:border-zinc-700/40',
  },
  {
    icon: Code,
    label: 'Code',
    prompt: 'Help me code',
    color: 'hover:bg-white/5 hover:text-zinc-400 hover:border-zinc-700/40',
  },
  {
    icon: Briefcase,
    label: 'Work',
    prompt: 'Help me with work',
    color: 'hover:bg-white/5 hover:text-zinc-300 hover:border-zinc-700/40',
  },
  {
    icon: Sparkles,
    label: "AI's choice",
    prompt: 'Surprise me with something interesting',
    color: 'hover:bg-white/5 hover:text-zinc-300 hover:border-zinc-700/40',
  },
];

// Helper: get the correct provider string for a model
function getProviderForModel(modelId: string): string {
  const model = LLM_MODELS.find(m => m.id === modelId);
  if (!model) return 'groq';
  const providerMap: Record<string, string> = {
    OpenAI: 'openai',
    Anthropic: 'anthropic',
    Google: 'google',
    Meta: 'groq', // Meta models run on Groq
    xAI: 'xai',
    Groq: 'groq',
    Mistral: 'mistral',
    DeepSeek: 'deepseek',
    Alibaba: 'groq', // Qwen models run on Groq
    Moonshot: 'groq',
  };
  return providerMap[model.provider] || 'groq';
}

// Helper: get context window config for a model
function getContextWindowConfig(modelId: string): {
  maxTokens: number;
  reservedForResponse: number;
  reservedForConversation: number;
} {
  const model = LLM_MODELS.find(m => m.id === modelId);
  const provider = model?.provider || '';

  if (provider === 'Anthropic')
    return { maxTokens: 200000, reservedForResponse: 8192, reservedForConversation: 50000 };
  if (provider === 'Google')
    return { maxTokens: 1000000, reservedForResponse: 8192, reservedForConversation: 100000 };
  if (modelId.includes('gpt-5') || modelId.includes('gpt-4'))
    return { maxTokens: 128000, reservedForResponse: 4096, reservedForConversation: 32000 };
  return { maxTokens: 32000, reservedForResponse: 2048, reservedForConversation: 8000 };
}

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
  const [attachedFiles, setAttachedFiles] = useState<
    { name: string; content: string; type: string }[]
  >([]);
  const [contextStatus, setContextStatus] = useState<string>('');

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

  // Auto-generate schema context when a database connection is selected
  useEffect(() => {
    if (!selectedConnection) {
      setContextStatus('');
      return;
    }

    const generateSchema = async () => {
      try {
        const conn = connections.find(c => c.id === selectedConnection);
        if (!conn) return;

        // Check if schema context already exists for this connection
        const existingContexts = await window.electron?.context?.list?.({
          connectionId: selectedConnection,
        });
        const hasSchema = existingContexts?.some?.((c: any) => c.type === 'database_schema');

        if (!hasSchema) {
          console.log(`[Chat] Auto-generating schema context for ${conn.name}...`);
          const result = await window.electron?.mcp?.generateSchemaContext?.(
            selectedConnection,
            conn.name
          );
          if (result?.success) {
            console.log(`[Chat] Schema context created for ${conn.name}`);
          }
        }
      } catch (err) {
        console.warn('Auto-schema generation skipped:', err);
      }
    };

    generateSchema();
  }, [selectedConnection, connections]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConnections = async () => {
    try {
      // Try to get connections from MCP first (local), fall back to Express API
      const conns =
        (await window.electron.mcp?.getAllConnections?.()) ||
        (await window.electron.express?.getUserConnections?.()) ||
        [];
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
      // Try electron IPC first (main process electron-store)
      const chatSessions = (await window.electron.chat?.getAllConversations?.()) || [];
      const result = chatSessions as any;
      const sessionsArray = Array.isArray(result) ? result : result?.data || [];

      if (sessionsArray.length > 0) {
        setSessions(
          sessionsArray.map((s: any) => ({
            id: s.id,
            title: s.title || 'Untitled',
            messages: (s.messages || []).map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp || m.createdAt || Date.now()),
            })),
            createdAt: new Date(s.createdAt || Date.now()),
            updatedAt: new Date(s.updatedAt || Date.now()),
            pinned: s.pinned,
            archived: s.archived,
          }))
        );
        return;
      }

      // Fallback to localStorage
      const stored = localStorage.getItem('velanova_chat_sessions');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(
            parsed.map((s: any) => ({
              ...s,
              createdAt: new Date(s.createdAt),
              updatedAt: new Date(s.updatedAt),
              messages: (s.messages || []).map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp),
              })),
            }))
          );
        }
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      // Last resort: localStorage
      try {
        const stored = localStorage.getItem('velanova_chat_sessions');
        if (stored) {
          const parsed = JSON.parse(stored);
          setSessions(
            parsed.map((s: any) => ({
              ...s,
              createdAt: new Date(s.createdAt),
              updatedAt: new Date(s.updatedAt),
              messages: (s.messages || []).map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp),
              })),
            }))
          );
        }
      } catch {
        /* ignore */
      }
      setSessions([]);
    }
  };

  // Persist sessions to both electron-store and localStorage
  const persistSessions = async (allSessions: ChatSession[], updatedSession: ChatSession) => {
    try {
      // Save to localStorage immediately (synchronous fallback)
      const toStore = allSessions.map(s => ({ ...s, messages: s.messages || [] }));
      localStorage.setItem('velanova_chat_sessions', JSON.stringify(toStore));

      // Save full session to electron-store via IPC
      await window.electron.api?.saveChatSession?.({
        id: updatedSession.id,
        title: updatedSession.title,
        messages: updatedSession.messages,
        createdAt: updatedSession.createdAt,
        updatedAt: updatedSession.updatedAt,
      });
    } catch {
      /* ignore persistence errors, don't block UI */
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
    setSessions(prev => {
      const updated = [newSession, ...prev];
      // Persist the session list
      localStorage.setItem('velanova_chat_sessions', JSON.stringify(updated));
      return updated;
    });
    setCurrentSession(newSession);
    setInput('');
    textareaRef.current?.focus();
  }, []);

  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions(prev => {
        const updated = prev.filter(s => s.id !== sessionId);
        localStorage.setItem('velanova_chat_sessions', JSON.stringify(updated));
        return updated;
      });
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
      // Also delete from electron-store
      window.electron.chat?.deleteConversation?.(sessionId).catch(() => {});
    },
    [currentSession]
  );

  // File attachment handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: { name: string; content: string; type: string }[] = [];

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
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
      const fileContents = attachedFiles
        .map(f => `\n\n---\n📎 **File: ${f.name}**\n\`\`\`\n${f.content}\n\`\`\``)
        .join('');
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
    setSessions(prev => prev.map(s => (s.id === session!.id ? updatedSession : s)));
    setInput('');
    setIsLoading(true);

    try {
      let response;
      const provider = getProviderForModel(selectedModel);

      // Compile contexts (system prompts, database schemas, knowledge, etc.)
      let systemMessages: { role: string; content: string }[] = [];
      try {
        const contextConfig = getContextWindowConfig(selectedModel);
        const compiled = await window.electron?.context?.compile?.({
          config: contextConfig,
          connectionId: selectedConnection || undefined,
        });

        if (compiled?.systemPrompt) {
          systemMessages = [{ role: 'system', content: compiled.systemPrompt }];
          setContextStatus(
            `${compiled.contexts?.length || 0} contexts (${compiled.totalTokens || 0} tokens)`
          );
        }
      } catch (ctxErr) {
        console.warn('Context compilation skipped:', ctxErr);
      }

      if (selectedConnection) {
        // DATABASE MODE: Query via MCP, then optionally analyze with AI
        const mcp = window.electron.mcp as any;
        const isNaturalLanguage =
          !input.trim().toUpperCase().startsWith('SELECT') &&
          !input.trim().toUpperCase().startsWith('INSERT') &&
          !input.trim().toUpperCase().startsWith('UPDATE') &&
          !input.trim().toUpperCase().startsWith('DELETE') &&
          !input.trim().toUpperCase().startsWith('CREATE') &&
          !input.trim().toUpperCase().startsWith('ALTER') &&
          !input.trim().toUpperCase().startsWith('DROP') &&
          !input.trim().toUpperCase().startsWith('SHOW') &&
          !input.trim().toUpperCase().startsWith('DESCRIBE') &&
          !input.trim().toUpperCase().startsWith('PRAGMA');

        if (isNaturalLanguage) {
          // Natural language → Ask AI to generate SQL first, with DB schema context
          const connName =
            connections.find(c => c.id === selectedConnection)?.name || selectedConnection;
          const queryMessages = [
            ...systemMessages,
            {
              role: 'system',
              content: `You are connected to database "${connName}". The user will ask questions about the data. Generate and explain SQL queries, or analyze results. When generating SQL, wrap it in \`\`\`sql code blocks.`,
            },
            ...updatedMessages.map(m => ({ role: m.role, content: m.content })),
          ];

          response = await window.electron.express?.queryAI?.({
            userId: 'local-user',
            licenseId: 'local',
            provider,
            model: selectedModel,
            messages: queryMessages,
            connectionId: selectedConnection,
          });
        } else if (mcp?.query) {
          // Direct SQL → Execute via MCP, then format results
          const mcpResult = await mcp.query(selectedConnection, input.trim());

          if (mcpResult?.success && mcpResult?.data) {
            // Format MCP results as AI-friendly response
            const resultText =
              typeof mcpResult.data === 'string'
                ? mcpResult.data
                : JSON.stringify(mcpResult.data, null, 2);

            // Send to AI for analysis
            response = await window.electron.express?.queryAI?.({
              userId: 'local-user',
              licenseId: 'local',
              provider,
              model: selectedModel,
              messages: [
                ...systemMessages,
                {
                  role: 'system',
                  content:
                    'Analyze the following database query results and provide a clear summary.',
                },
                {
                  role: 'user',
                  content: `SQL Query: ${input.trim()}\n\nResults:\n\`\`\`json\n${resultText}\n\`\`\``,
                },
              ],
            });
          } else {
            // MCP query failed, return error
            response = { content: `Database query failed: ${mcpResult?.error || 'Unknown error'}` };
          }
        } else {
          // Fallback: send via Express with connection context
          response = await window.electron.express?.queryAI?.({
            userId: 'local-user',
            licenseId: 'local',
            provider,
            model: selectedModel,
            messages: [
              ...systemMessages,
              ...updatedMessages.map(m => ({ role: m.role, content: m.content })),
            ],
            connectionId: selectedConnection,
          });
        }
      } else {
        // CHAT MODE: Standard AI conversation with compiled contexts
        response = await window.electron.express?.queryAI?.({
          userId: 'local-user',
          licenseId: 'local',
          provider,
          model: selectedModel,
          messages: [
            ...systemMessages,
            ...updatedMessages.map(m => ({ role: m.role, content: m.content })),
          ],
        });
      }

      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content:
          (response as any)?.content ||
          (response as any)?.message ||
          (response as any)?.data?.content ||
          (response as any)?.data?.response ||
          (response as any)?.response ||
          'No response received',
        timestamp: new Date(),
        model: selectedModel,
        tokens:
          (response as any)?.tokens || (response as any)?.usage || (response as any)?.data?.usage,
        cost: (response as any)?.cost || (response as any)?.data?.usage?.cost,
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, assistantMessage],
        updatedAt: new Date(),
      };

      setCurrentSession(finalSession);
      setSessions(prev => prev.map(s => (s.id === session!.id ? finalSession : s)));

      // Auto-generate conversation memory summary every 10 messages
      if (finalSession.messages.length > 0 && finalSession.messages.length % 10 === 0) {
        try {
          const recentMessages = finalSession.messages.slice(-10);
          const summaryPrompt = recentMessages.map(m => `${m.role}: ${m.content}`).join('\n');

          // Extract key facts for memory
          const keyFacts = recentMessages
            .filter(m => m.role === 'assistant')
            .map(m => m.content.slice(0, 200))
            .slice(0, 5);

          await window.electron?.context?.createMemory?.({
            conversationId: session!.id,
            summary: `Conversation summary (${finalSession.messages.length} messages): ${finalSession.title}. Topics discussed: ${summaryPrompt.slice(0, 500)}`,
            keyFacts,
          });
          console.log('[Chat] Memory summary saved');
        } catch (memErr) {
          console.warn('Memory summary creation skipped:', memErr);
        }
      }

      try {
        await persistSessions(
          sessions.map(s => (s.id === session!.id ? finalSession : s)),
          finalSession
        );
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
      setSessions(prev => prev.map(s => (s.id === session!.id ? errorSession : s)));
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
    <div className="flex h-full overflow-hidden bg-black text-white">
      {/* History Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 264, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col flex-shrink-0 border-r bg-[#080808] border-white/[0.06] overflow-hidden"
            style={{ width: 264 }}
          >
            {/* Header with New Chat */}
            <div className="h-12 flex items-center justify-between px-3 border-b border-white/[0.06]">
              <span className="text-[12px] font-medium text-zinc-500 uppercase tracking-widest">
                History
              </span>
              <button
                onClick={createNewSession}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-[12px] font-medium hover:bg-zinc-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New Chat
              </button>
            </div>

            {/* Search */}
            <div className="px-3 py-2.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Search conversations…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] pl-8 pr-3 py-2 text-[13px] focus:outline-none focus:border-white/[0.12] text-zinc-300 placeholder:text-zinc-600 transition-colors"
                />
              </div>
            </div>

            {/* Chat History List */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {filteredSessions.length === 0 ? (
                <div className="py-10 text-center">
                  <MessageSquare className="w-8 h-8 text-zinc-800 mx-auto mb-2" />
                  <p className="text-[12px] text-zinc-600">
                    {searchQuery ? 'No chats found' : 'No conversations yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filteredSessions.map(session => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        'group relative flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg cursor-pointer transition-all',
                        currentSession?.id === session.id
                          ? 'bg-white/[0.07] border border-white/[0.07]'
                          : 'hover:bg-white/[0.04] border border-transparent'
                      )}
                      onClick={() => setCurrentSession(session)}
                    >
                      <MessageSquare
                        className={cn(
                          'w-3.5 h-3.5 flex-shrink-0',
                          currentSession?.id === session.id ? 'text-zinc-300' : 'text-zinc-600'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'truncate text-[13px] leading-tight',
                            currentSession?.id === session.id ? 'text-zinc-100' : 'text-zinc-400'
                          )}
                        >
                          {session.title}
                        </p>
                        <p className="text-[11px] text-zinc-700 mt-0.5">
                          {session.messages.length} msg{session.messages.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <button
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-white/[0.05] transition-all"
                        onClick={e => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Collapse Button */}
            <div className="p-2.5 border-t border-white/[0.06]">
              <button
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-all"
                onClick={() => setSidebarOpen(false)}
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-zinc-900"
                onClick={() => setSidebarOpen(true)}
              >
                <PanelLeft className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-zinc-900"
              onClick={createNewSession}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {/* Center - Can show connection if selected */}
          {selectedConnection && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Database className="w-3.5 h-3.5" />
              {connections.find(c => c.id === selectedConnection)?.name}
              {contextStatus && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-zinc-900/40 text-zinc-400">
                  {contextStatus}
                </span>
              )}
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
                <h1 className="font-medium mb-2 text-white">
                  {getGreeting()}, {getFirstName()}
                </h1>
                <p className="text-muted-foreground">How can I help you today?</p>
              </div>

              {/* Input Box */}
              <div className="w-full max-w-2xl mb-6">
                {/* Attached Files Preview */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/30 text-zinc-400"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="truncate max-w-[150px]">{file.name}</span>
                        <button
                          onClick={() => removeAttachedFile(index)}
                          className="hover:text-zinc-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative rounded-2xl border border-white/[0.08] focus-within:border-white/[0.16] transition-colors shadow-sm bg-[#0d0d0d]">
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
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything…"
                    className="w-full bg-transparent resize-none px-5 py-4 pr-28 focus:outline-none min-h-[56px] max-h-[200px] text-white placeholder:text-zinc-600"
                    rows={1}
                    disabled={isLoading}
                  />

                  {/* Bottom row inside input */}
                  <div className="flex items-center justify-between px-4 pb-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach files"
                        className="p-2 rounded-lg transition-colors text-muted-foreground hover:text-zinc-400 hover:bg-zinc-900"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg transition-colors text-muted-foreground hover:text-zinc-400 hover:bg-zinc-900">
                        <Clock className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Model Selector */}
                      <div className="relative" ref={modelDropdownRef}>
                        <button
                          onClick={() => setShowModelDropdown(!showModelDropdown)}
                          className="flex items-center gap-2 transition-colors text-muted-foreground hover:text-zinc-300"
                        >
                          {selectedModelInfo.hasIcon ? (
                            <img
                              src={selectedModelInfo.icon}
                              alt={selectedModelInfo.name}
                              className={cn(
                                'w-4 h-4',
                                (selectedModelInfo as any).needsInvert && 'invert'
                              )}
                            />
                          ) : (
                            <span className="text-base">{selectedModelInfo.logo}</span>
                          )}
                          {selectedModelInfo.name}
                          <ChevronDown
                            className={cn(
                              'w-3.5 h-3.5 transition-transform',
                              showModelDropdown && 'rotate-180'
                            )}
                          />
                        </button>

                        <AnimatePresence>
                          {showModelDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -8, scale: 0.97 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -8, scale: 0.97 }}
                              className="absolute top-full right-0 mt-2 rounded-xl shadow-2xl overflow-hidden z-50 w-64 bg-[#0e0e0e] border border-white/[0.08]"
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
                                      'w-full px-4 py-2.5 text-left transition-colors flex items-center gap-3 hover:bg-zinc-900',
                                      selectedModel === model.id && 'bg-zinc-900'
                                    )}
                                  >
                                    {model.hasIcon ? (
                                      <img
                                        src={model.icon}
                                        alt={model.name}
                                        className={cn(
                                          'w-5 h-5 flex-shrink-0',
                                          (model as any).needsInvert && 'invert'
                                        )}
                                      />
                                    ) : (
                                      <span className="text-base flex-shrink-0">{model.logo}</span>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="text-zinc-100">{model.name}</div>
                                      <div className="text-muted-foreground">{model.provider}</div>
                                    </div>
                                    {selectedModel === model.id && (
                                      <Check className="w-4 h-4 text-zinc-300" />
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
                          'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                          input.trim()
                            ? 'bg-white hover:bg-zinc-100 text-black'
                            : 'bg-white/[0.05] text-zinc-600 cursor-not-allowed'
                        )}
                      >
                        {isLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {QUICK_ACTIONS.map(action => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-white/[0.07] bg-white/[0.02] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all text-[13px]"
                  >
                    <action.icon className="w-3.5 h-3.5" />
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Database Connection Selector */}
              {connections.length > 0 && (
                <div className="mt-8">
                  <select
                    value={selectedConnection}
                    onChange={e => setSelectedConnection(e.target.value)}
                    className="rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-600 bg-zinc-950 border-zinc-800 text-zinc-400"
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
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Message Content */}
                    <div className={cn('max-w-[80%]', message.role === 'user' ? 'order-1' : '')}>
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-3',
                          message.role === 'user'
                            ? 'bg-white text-black'
                            : 'bg-white/[0.05] border border-white/[0.07] text-zinc-100'
                        )}
                      >
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm prose-invert max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code({ inline, className, children, ...props }: any) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  return !inline && match ? (
                                    <div className="relative my-4">
                                      <div className="flex items-center justify-between px-4 py-2 rounded-t-lg border-b bg-black border-zinc-800">
                                        <span className="text-xs text-muted-foreground font-mono">
                                          {match[1]}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 px-2 text-muted-foreground hover:text-zinc-300"
                                          onClick={() =>
                                            copyToClipboard(String(children), message.id)
                                          }
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
                                    <code
                                      className="px-1.5 py-0.5 rounded text-sm bg-zinc-800"
                                      {...props}
                                    >
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
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 px-1">
                        <span className="text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.model && (
                          <span className="text-muted-foreground">
                            • {LLM_MODELS.find(m => m.id === message.model)?.name || message.model}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* User Avatar */}
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 order-2">
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-zinc-900">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span
                          className="w-2 h-2 rounded-full animate-bounce bg-zinc-700"
                          style={{ animationDelay: '0ms' }}
                        />
                        <span
                          className="w-2 h-2 rounded-full animate-bounce bg-zinc-700"
                          style={{ animationDelay: '150ms' }}
                        />
                        <span
                          className="w-2 h-2 rounded-full animate-bounce bg-zinc-700"
                          style={{ animationDelay: '300ms' }}
                        />
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
          <div className="border-t p-4 border-zinc-800">
            <div className="max-w-3xl mx-auto">
              {/* Attached Files Preview */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {attachedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/30 text-zinc-400"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <button
                        onClick={() => removeAttachedFile(index)}
                        className="hover:text-zinc-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative rounded-2xl border border-white/[0.08] focus-within:border-white/[0.16] transition-colors bg-[#0d0d0d]">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Reply to Velanova…"
                  className="w-full bg-transparent resize-none px-5 py-4 pr-20 focus:outline-none min-h-[56px] max-h-[200px] text-white placeholder:text-zinc-600"
                  rows={1}
                  disabled={isLoading}
                />

                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach files"
                    className="p-1.5 rounded-lg transition-colors text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.05]"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-zinc-700">{selectedModelInfo.name}</span>

                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                      input.trim()
                        ? 'bg-white hover:bg-zinc-100 text-black'
                        : 'bg-white/[0.05] text-zinc-600 cursor-not-allowed'
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-zinc-700 text-center">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
