/**
 * Chat History Manager - Local storage for chat conversations
 */

import Store from 'electron-store';
import { AIProvider } from '@shared/types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tokens?: number;
  cost?: number;
}

export interface ChatConversation {
  id: string;
  title: string;
  connectionId?: string;
  connectionName?: string;
  provider: AIProvider;
  model: string;
  messages: ChatMessage[];
  totalTokens: number;
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
  pinned: boolean;
  archived: boolean;
}

export interface ChatHistoryStats {
  totalConversations: number;
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  providerBreakdown: Record<AIProvider, {
    conversations: number;
    tokens: number;
    cost: number;
  }>;
}

export class ChatHistoryManager {
  private store: Store<any>;
  private conversations: Map<string, ChatConversation> = new Map();

  constructor() {
    this.store = new Store({
      name: 'chat-history',
      defaults: {
        conversations: [],
      },
    });

    this.loadConversations();
  }

  private loadConversations() {
    const saved = this.store.get('conversations', []);
    saved.forEach((conv: any) => {
      // Convert date strings back to Date objects
      conv.createdAt = new Date(conv.createdAt);
      conv.updatedAt = new Date(conv.updatedAt);
      conv.messages = conv.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
      this.conversations.set(conv.id, conv);
    });
  }

  private saveConversations() {
    const conversations = Array.from(this.conversations.values());
    this.store.set('conversations', conversations);
  }

  // Create new conversation
  createConversation(data: {
    connectionId?: string;
    connectionName?: string;
    provider: AIProvider;
    model: string;
    initialMessage?: string;
  }): ChatConversation {
    const id = crypto.randomUUID();
    const now = new Date();

    const messages: ChatMessage[] = [];
    if (data.initialMessage) {
      messages.push({
        id: crypto.randomUUID(),
        role: 'user',
        content: data.initialMessage,
        timestamp: now,
      });
    }

    const conversation: ChatConversation = {
      id,
      title: this.generateTitle(data.initialMessage || 'New conversation'),
      connectionId: data.connectionId,
      connectionName: data.connectionName,
      provider: data.provider,
      model: data.model,
      messages,
      totalTokens: 0,
      totalCost: 0,
      createdAt: now,
      updatedAt: now,
      pinned: false,
      archived: false,
    };

    this.conversations.set(id, conversation);
    this.saveConversations();

    return conversation;
  }

  // Add message to conversation
  addMessage(
    conversationId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'>
  ): ChatMessage {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const chatMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    conversation.messages.push(chatMessage);
    conversation.updatedAt = new Date();

    if (message.tokens) {
      conversation.totalTokens += message.tokens;
    }
    if (message.cost) {
      conversation.totalCost += message.cost;
    }

    // Update title if this is the second message (first user + first assistant)
    if (conversation.messages.length === 2 && message.role === 'assistant') {
      conversation.title = this.generateTitle(conversation.messages[0].content);
    }

    this.saveConversations();

    return chatMessage;
  }

  // Get conversation by ID
  getConversation(id: string): ChatConversation | undefined {
    return this.conversations.get(id);
  }

  // Get all conversations (with filtering)
  getAllConversations(options?: {
    includeArchived?: boolean;
    pinnedOnly?: boolean;
    connectionId?: string;
    provider?: AIProvider;
    limit?: number;
  }): ChatConversation[] {
    let conversations = Array.from(this.conversations.values());

    // Filter archived
    if (!options?.includeArchived) {
      conversations = conversations.filter(c => !c.archived);
    }

    // Filter pinned
    if (options?.pinnedOnly) {
      conversations = conversations.filter(c => c.pinned);
    }

    // Filter by connection
    if (options?.connectionId) {
      conversations = conversations.filter(c => c.connectionId === options.connectionId);
    }

    // Filter by provider
    if (options?.provider) {
      conversations = conversations.filter(c => c.provider === options.provider);
    }

    // Sort by updatedAt (most recent first)
    conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    // Limit results
    if (options?.limit) {
      conversations = conversations.slice(0, options.limit);
    }

    return conversations;
  }

  // Update conversation
  updateConversation(
    id: string,
    updates: Partial<Pick<ChatConversation, 'title' | 'pinned' | 'archived'>>
  ): void {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    Object.assign(conversation, updates);
    conversation.updatedAt = new Date();

    this.saveConversations();
  }

  // Delete conversation
  deleteConversation(id: string): void {
    this.conversations.delete(id);
    this.saveConversations();
  }

  // Clear all messages in conversation
  clearConversation(id: string): void {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    conversation.messages = [];
    conversation.totalTokens = 0;
    conversation.totalCost = 0;
    conversation.updatedAt = new Date();

    this.saveConversations();
  }

  // Search conversations
  searchConversations(query: string): ChatConversation[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.conversations.values())
      .filter(conv => {
        // Search in title
        if (conv.title.toLowerCase().includes(lowerQuery)) {
          return true;
        }
        // Search in messages
        return conv.messages.some(msg =>
          msg.content.toLowerCase().includes(lowerQuery)
        );
      })
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // Get statistics
  getStats(): ChatHistoryStats {
    const conversations = Array.from(this.conversations.values());
    
    const providerBreakdown: Record<string, any> = {};
    let totalMessages = 0;
    let totalTokens = 0;
    let totalCost = 0;

    conversations.forEach(conv => {
      if (!providerBreakdown[conv.provider]) {
        providerBreakdown[conv.provider] = {
          conversations: 0,
          tokens: 0,
          cost: 0,
        };
      }

      providerBreakdown[conv.provider].conversations++;
      providerBreakdown[conv.provider].tokens += conv.totalTokens;
      providerBreakdown[conv.provider].cost += conv.totalCost;

      totalMessages += conv.messages.length;
      totalTokens += conv.totalTokens;
      totalCost += conv.totalCost;
    });

    return {
      totalConversations: conversations.length,
      totalMessages,
      totalTokens,
      totalCost,
      providerBreakdown: providerBreakdown as any,
    };
  }

  // Export conversation to JSON
  exportConversation(id: string): string {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return JSON.stringify(conversation, null, 2);
  }

  // Import conversation from JSON
  importConversation(json: string): ChatConversation {
    const data = JSON.parse(json);
    
    // Generate new ID
    const id = crypto.randomUUID();
    const conversation: ChatConversation = {
      ...data,
      id,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(),
      messages: data.messages.map((msg: any) => ({
        ...msg,
        id: crypto.randomUUID(),
        timestamp: new Date(msg.timestamp),
      })),
    };

    this.conversations.set(id, conversation);
    this.saveConversations();

    return conversation;
  }

  // Generate smart title from first message
  private generateTitle(content: string): string {
    // Take first 50 characters
    let title = content.substring(0, 50);
    
    // Clean up
    title = title.replace(/\n/g, ' ').trim();
    
    // Add ellipsis if truncated
    if (content.length > 50) {
      title += '...';
    }

    return title || 'New conversation';
  }

  // Clean up old conversations
  cleanupOldConversations(daysOld: number = 90): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    let deletedCount = 0;

    for (const [id, conv] of this.conversations) {
      if (!conv.pinned && conv.updatedAt < cutoffDate) {
        this.conversations.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      this.saveConversations();
    }

    return deletedCount;
  }

  // Get recent conversations
  getRecentConversations(limit: number = 10): ChatConversation[] {
    return this.getAllConversations({ limit, includeArchived: false });
  }

  // Pin/unpin conversation
  togglePin(id: string): void {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    conversation.pinned = !conversation.pinned;
    conversation.updatedAt = new Date();

    this.saveConversations();
  }

  // Archive/unarchive conversation
  toggleArchive(id: string): void {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    conversation.archived = !conversation.archived;
    conversation.updatedAt = new Date();

    this.saveConversations();
  }
}

export const chatHistoryManager = new ChatHistoryManager();
