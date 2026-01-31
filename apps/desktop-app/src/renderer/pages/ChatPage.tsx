import React, { useEffect, useState, useRef } from 'react';
import ModelSelector from '../components/ModelSelector';
import ChatHistorySidebar from '../components/ChatHistorySidebar';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  tokens?: number;
  cost?: number;
}

interface Conversation {
  id: string;
  title: string;
  connectionId?: string;
  connectionName?: string;
  provider: string;
  model: string;
  messages: Message[];
  totalTokens: number;
  totalCost: number;
}

interface MCPConnection {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  status: string;
}

const ChatPage: React.FC = () => {
  // Chat state
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Model selection
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Connection selection
  const [connections, setConnections] = useState<MCPConnection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');

  // UI state
  const [showSidebar, setShowSidebar] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadConnections();
    checkExpressHealth();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  const loadConnections = async () => {
    try {
      const allConnections = await window.electron.mcp.getAllConnections();
      const enabledConnections = allConnections.filter((c: MCPConnection) => c.enabled && c.status === 'connected');
      setConnections(enabledConnections);
      if (enabledConnections.length > 0 && !selectedConnectionId) {
        setSelectedConnectionId(enabledConnections[0].id);
      }
    } catch (err: any) {
      // Silently handle API key errors - user might not have backend configured yet
      if (!err?.message?.includes('Invalid API key')) {
        console.error('Error loading connections:', err);
      }
    }
  };

  const checkExpressHealth = async () => {
    try {
      const health = await window.electron.express.checkHealth();
      if (!health.success) {
        setError('Express API is not running. Please start the backend server.');
      }
    } catch (err) {
      setError('Cannot connect to Express API. Make sure it\'s running on localhost:5500');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewChat = () => {
    setCurrentConversation(null);
    setMessages([]);
    setInputValue('');
    setError(null);
  };

  const handleSelectConversation = async (conversationId: string) => {
    try {
      const conversation = await window.electron.chat.getConversation(conversationId);
      setCurrentConversation(conversation);
      setMessages(conversation.messages);
      setSelectedProvider(conversation.provider);
      setSelectedModel(conversation.model);
      if (conversation.connectionId) {
        setSelectedConnectionId(conversation.connectionId);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load conversation');
    }
  };

  const handleDeleteConversation = (conversationId: string) => {
    if (currentConversation?.id === conversationId) {
      handleNewChat();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    if (!selectedProvider || !selectedModel) {
      setError('Please select an AI provider and model');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    // Add user message to UI
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Create conversation if new chat
      let conversationId = currentConversation?.id;
      if (!conversationId) {
        const connection = connections.find((c) => c.id === selectedConnectionId);
        const newConversation = await window.electron.chat.createConversation({
          connectionId: selectedConnectionId || undefined,
          connectionName: connection?.name,
          provider: selectedProvider,
          model: selectedModel,
          initialMessage: userMessage.content,
        });
        conversationId = newConversation.id;
        setCurrentConversation(newConversation);
      } else {
        // Add message to existing conversation
        await window.electron.chat.addMessage(conversationId, {
          role: 'user',
          content: userMessage.content,
        });
      }

      // Query AI via Express API
      const result = await window.electron.express.queryAI({
        userId: 'default-user', // TODO: Get from auth
        licenseId: 'default-license', // TODO: Get from license manager
        provider: selectedProvider,
        model: selectedModel,
        messages: [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.7,
        maxTokens: 2000,
        connectionId: selectedConnectionId || undefined,
      });

      if (result.success && result.data) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.data.response,
          timestamp: new Date(),
          tokens: result.data.usage?.tokensUsed,
          cost: result.data.usage?.cost,
        };

        // Add assistant message to UI
        setMessages((prev) => [...prev, assistantMessage]);

        // Save to conversation
        await window.electron.chat.addMessage(conversationId, {
          role: 'assistant',
          content: assistantMessage.content,
          tokens: assistantMessage.tokens,
          cost: assistantMessage.cost,
        });

        // Log usage to Express
        if (result.data.usage) {
          await window.electron.express.logUsage({
            userId: 'default-user',
            licenseId: 'default-license',
            eventType: 'ai_query',
            provider: selectedProvider,
            model: selectedModel,
            tokensUsed: result.data.usage.tokensUsed,
            cost: result.data.usage.cost,
            metadata: {
              conversationId,
              connectionId: selectedConnectionId,
            },
          });
        }

        // Update conversation metadata
        const updatedConversation = await window.electron.chat.getConversation(conversationId);
        setCurrentConversation(updatedConversation);
      } else {
        throw new Error(result.error || 'Failed to get AI response');
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message. Please try again.');
      
      // Add error message to UI
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to get response from AI'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatCost = (cost?: number): string => {
    if (!cost) return '$0.00';
    return `$${cost.toFixed(4)}`;
  };

  const formatTimestamp = (date?: Date): string => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 flex-shrink-0 border-r border-white/5">
          <ChatHistorySidebar
            selectedConversationId={currentConversation?.id}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            onDeleteConversation={handleDeleteConversation}
          />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header - Glassmorphism */}
        <div className="h-16 backdrop-blur-xl bg-white/[0.02] border-b border-white/5 flex items-center justify-between px-6 relative z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-white/5 rounded-xl transition-all duration-200 group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {currentConversation?.title || 'New Chat'}
              </h1>
              {currentConversation && (
                <p className="text-xs text-gray-500">
                  {currentConversation.messages.length} messages • {formatCost(currentConversation.totalCost)}
                </p>
              )}
            </div>
          </div>

          {/* Connection Selector */}
          {connections.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Database:</span>
              <select
                value={selectedConnectionId}
                onChange={(e) => setSelectedConnectionId(e.target.value)}
                disabled={isLoading}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 hover:bg-white/10 transition-all cursor-pointer"
              >
                <option value="" className="bg-[#1A1A1A]">None</option>
                {connections.map((conn) => (
                  <option key={conn.id} value={conn.id} className="bg-[#1A1A1A]">
                    {conn.name} ({conn.type})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Messages - Beautiful Gradient Background */}
        <div className="flex-1 overflow-y-auto relative">
          {/* Ambient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-purple-500/[0.03] pointer-events-none" />
          
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full relative z-10">
              <div className="text-center max-w-3xl px-6 animate-in fade-in duration-700">
                {/* Gradient Icon */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center backdrop-blur-xl border border-white/10">
                  <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-3">
                  Start a Conversation
                </h2>
                <p className="text-gray-500 mb-8 text-base">
                  Select an AI model and start chatting. Query databases, get code help, or have a general conversation.
                </p>
                
                {/* Feature Cards - Modern Design */}
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="group p-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-300 cursor-pointer backdrop-blur-xl">
                    <div className="text-3xl mb-3">💡</div>
                    <div className="text-sm font-semibold text-white mb-1.5 group-hover:text-blue-400 transition-colors">Query Database</div>
                    <div className="text-xs text-gray-500 leading-relaxed">Connect to a database and ask questions in natural language</div>
                  </div>
                  <div className="group p-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-300 cursor-pointer backdrop-blur-xl">
                    <div className="text-3xl mb-3">🔧</div>
                    <div className="text-sm font-semibold text-white mb-1.5 group-hover:text-purple-400 transition-colors">Code Assistance</div>
                    <div className="text-xs text-gray-500 leading-relaxed">Get help with SQL queries, debugging, and optimization</div>
                  </div>
                  <div className="group p-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-300 cursor-pointer backdrop-blur-xl">
                    <div className="text-3xl mb-3">📊</div>
                    <div className="text-sm font-semibold text-white mb-1.5 group-hover:text-green-400 transition-colors">Data Analysis</div>
                    <div className="text-xs text-gray-500 leading-relaxed">Analyze data patterns and generate insights</div>
                  </div>
                  <div className="group p-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-300 cursor-pointer backdrop-blur-xl">
                    <div className="text-3xl mb-3">✨</div>
                    <div className="text-sm font-semibold text-white mb-1.5 group-hover:text-orange-400 transition-colors">Multi-Provider</div>
                    <div className="text-xs text-gray-500 leading-relaxed">Choose from 15+ AI providers and 50+ models</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6 relative z-10">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {message.role === 'assistant' && (
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  )}
                  <div className={`flex-1 max-w-3xl ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                    <div
                      className={`group relative ${
                        message.role === 'user'
                          ? 'px-5 py-3.5 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                          : message.content.startsWith('Error:')
                          ? 'px-5 py-3.5 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 backdrop-blur-xl'
                          : 'px-5 py-3.5 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-white shadow-xl'
                      }`}
                    >
                      <div className="prose prose-invert max-w-none">
                        <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{message.content}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-3 text-xs opacity-60">
                        <span>{formatTimestamp(message.timestamp)}</span>
                        {message.tokens && (
                          <>
                            <span>•</span>
                            <span>{message.tokens} tokens</span>
                          </>
                        )}
                        {message.cost && message.cost > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400">{formatCost(message.cost)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center flex-shrink-0 border border-white/10">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                    <svg className="w-5 h-5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 max-w-3xl">
                    <div className="px-5 py-3.5 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-xl">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm text-gray-400">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - Modern Glassmorphism */}
        <div className="border-t border-white/5 backdrop-blur-xl bg-white/[0.02] relative z-10">
          <div className="max-w-4xl mx-auto px-6 py-6">
            {/* Error Display - Modern */}
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 backdrop-blur-xl animate-in slide-in-from-top-2 duration-300">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-red-400 leading-relaxed">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Model Selector - Compact */}
            <div className="mb-4">
              <ModelSelector
                selectedProvider={selectedProvider}
                selectedModel={selectedModel}
                onProviderChange={setSelectedProvider}
                onModelChange={setSelectedModel}
                disabled={isLoading}
              />
            </div>

            {/* Input Container - Beautiful Design */}
            <div className="flex gap-3">
              <div className="flex-1 relative group">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message AI... (Shift+Enter for new line)"
                  disabled={isLoading}
                  rows={1}
                  className="w-full px-5 py-4 bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/10 focus:border-white/20 rounded-3xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none max-h-40 disabled:opacity-50 transition-all duration-200 backdrop-blur-xl shadow-xl"
                />
                {/* Character count or other info */}
                {inputValue && (
                  <div className="absolute bottom-3 right-4 text-xs text-gray-500">
                    {inputValue.length} chars
                  </div>
                )}
              </div>
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim() || !selectedProvider || !selectedModel}
                className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white rounded-3xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:shadow-none group relative overflow-hidden"
              >
                {/* Shine effect on hover */}
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span className="relative">Sending</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span className="relative">Send</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
