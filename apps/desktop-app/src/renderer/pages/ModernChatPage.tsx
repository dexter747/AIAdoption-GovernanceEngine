import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Database, User, Bot, Plus, Trash2, Copy, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatDate } from '../lib/utils';

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
}

export default function ModernChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [selectedConnection, setSelectedConnection] = useState('');
  const [connections, setConnections] = useState<any[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadConnections();
    loadModels();
    loadSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConnections = async () => {
    try {
      const conns = await window.electron.getUserConnections();
      setConnections(conns || []);
    } catch (error) {
      console.error('Failed to load connections:', error);
    }
  };

  const loadModels = async () => {
    try {
      const availableModels = await window.electron.getAvailableModels();
      setModels(availableModels || [
        'gpt-4o',
        'gpt-4o-mini',
        'claude-3-5-sonnet-20241022',
        'claude-3-5-haiku-20241022',
        'gemini-2.0-flash',
        'llama-3.3-70b-versatile',
      ]);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const chatSessions = await window.electron.getChatSessions();
      setSessions(chatSessions || []);
      if (chatSessions && chatSessions.length > 0) {
        setCurrentSession(chatSessions[0]);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions([newSession, ...sessions]);
    setCurrentSession(newSession);
  };

  const deleteSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    if (currentSession?.id === sessionId) {
      setCurrentSession(sessions[0] || null);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...(currentSession?.messages || []), userMessage];
    
    if (!currentSession) {
      createNewSession();
    }

    setCurrentSession(prev => prev ? {
      ...prev,
      messages: updatedMessages,
      title: prev.messages.length === 0 ? input.trim().slice(0, 50) : prev.title,
      updatedAt: new Date(),
    } : null);

    setInput('');
    setIsLoading(true);

    try {
      let response;
      
      if (selectedConnection) {
        // Use MCP for database queries
        response = await window.electron.queryWithMCP({
          connectionId: selectedConnection,
          query: input.trim(),
          model: selectedModel,
        });
      } else {
        // Regular AI chat
        response = await window.electron.chat({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel,
          stream: true,
        });
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content || response.message,
        timestamp: new Date(),
        model: selectedModel,
        tokens: response.tokens,
        cost: response.cost,
      };

      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, assistantMessage],
        updatedAt: new Date(),
      } : null);

      // Save session to backend
      await window.electron.saveChatSession(currentSession);
      
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to get response'}`,
        timestamp: new Date(),
      };

      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, errorMessage],
      } : null);
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

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Chat Sessions */}
      <div className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <Button
            onClick={createNewSession}
            className="w-full"
            variant="default"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {sessions.map(session => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={cn(
                'group p-3 rounded-lg mb-2 cursor-pointer transition-colors',
                currentSession?.id === session.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              )}
              onClick={() => setCurrentSession(session)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.title}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {formatDate(session.updatedAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Model & Connection Selector */}
        <div className="p-4 border-t space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border bg-background"
            >
              {models.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Database</label>
            <select
              value={selectedConnection}
              onChange={(e) => setSelectedConnection(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border bg-background"
            >
              <option value="">None (AI Chat)</option>
              {connections.map(conn => (
                <option key={conn.id} value={conn.id}>
                  {conn.name} ({conn.type})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">
                  {currentSession?.title || 'New Chat'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {selectedConnection ? (
                    <span className="flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      {connections.find(c => c.id === selectedConnection)?.name}
                    </span>
                  ) : (
                    <span>AI Assistant • {selectedModel}</span>
                  )}
                </p>
              </div>
            </div>

            {currentSession && currentSession.messages.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {currentSession.messages.length} messages
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {currentSession?.messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'flex gap-4',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}

                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl p-4',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border'
                  )}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-2 h-6 w-6"
                                  onClick={() => copyToClipboard(String(children), message.id)}
                                >
                                  {copiedId === message.id ? (
                                    <Check className="w-3 h-3" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </Button>
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              </div>
                            ) : (
                              <code className={className} {...props}>
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
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs opacity-70">{formatDate(message.timestamp)}</p>
                    {message.tokens && (
                      <span className="text-xs opacity-70">
                        • {message.tokens.input + message.tokens.output} tokens
                      </span>
                    )}
                    {message.cost && (
                      <span className="text-xs opacity-70">
                        • ${message.cost.toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground animate-pulse" />
              </div>
              <div className="bg-card border rounded-2xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4 bg-card">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedConnection 
                  ? "Ask a question about your database..." 
                  : "Message AI Nexus..."}
                className="min-h-[60px] max-h-[200px] pr-12 resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="absolute right-2 bottom-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
