/**
 * MCP Orchestrator Service
 * 
 * This service orchestrates the tool calling flow between:
 * 1. AI Provider (OpenAI, Anthropic, etc.) 
 * 2. Desktop App MCP Client (via WebSocket)
 * 
 * Flow:
 * User asks question -> AI decides to call tool -> Orchestrator sends to Desktop -> 
 * Desktop executes MCP tool -> Result returns -> AI generates final response
 */

import { EventEmitter } from 'events';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('mcp-orchestrator');

// Store active connections from desktop apps (WebSocket)
const activeDesktopConnections = new Map();

// Pending tool executions waiting for results
const pendingToolCalls = new Map();

/**
 * Register a desktop connection
 */
export function registerDesktopConnection(userId, connectionId, wsConnection) {
  const connectionKey = `${userId}:${connectionId}`;
  activeDesktopConnections.set(connectionKey, {
    userId,
    connectionId,
    ws: wsConnection,
    connectedAt: new Date(),
    availableTools: [],
  });
  
  logger.info({ userId, connectionId }, 'Desktop connection registered');
  return connectionKey;
}

/**
 * Unregister a desktop connection
 */
export function unregisterDesktopConnection(userId, connectionId) {
  const connectionKey = `${userId}:${connectionId}`;
  activeDesktopConnections.delete(connectionKey);
  logger.info({ userId, connectionId }, 'Desktop connection unregistered');
}

/**
 * Update available tools for a desktop connection
 */
export function updateDesktopTools(userId, connectionId, tools) {
  const connectionKey = `${userId}:${connectionId}`;
  const connection = activeDesktopConnections.get(connectionKey);
  
  if (connection) {
    connection.availableTools = tools;
    logger.info({ userId, connectionId, toolCount: tools.length }, 'Updated desktop tools');
  }
}

/**
 * Get all available tools for a user across all their connected desktops
 */
export function getAvailableToolsForUser(userId) {
  const tools = [];
  
  for (const [key, connection] of activeDesktopConnections) {
    if (connection.userId === userId && connection.availableTools) {
      tools.push(...connection.availableTools.map(tool => ({
        ...tool,
        connectionId: connection.connectionId,
      })));
    }
  }
  
  return tools;
}

/**
 * Check if user has any active desktop connections
 */
export function hasActiveDesktop(userId) {
  for (const [key, connection] of activeDesktopConnections) {
    if (connection.userId === userId) {
      return true;
    }
  }
  return false;
}

/**
 * Execute a tool call on the desktop via WebSocket
 * Returns a promise that resolves when the desktop sends back the result
 */
export async function executeToolOnDesktop(userId, toolCall, timeout = 30000) {
  // Find an active connection for this user
  let targetConnection = null;
  
  for (const [key, connection] of activeDesktopConnections) {
    if (connection.userId === userId) {
      targetConnection = connection;
      break;
    }
  }
  
  if (!targetConnection) {
    throw new Error('No active desktop connection for user');
  }
  
  const callId = `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return new Promise((resolve, reject) => {
    // Set timeout
    const timeoutId = setTimeout(() => {
      pendingToolCalls.delete(callId);
      reject(new Error(`Tool execution timed out after ${timeout}ms`));
    }, timeout);
    
    // Store pending call
    pendingToolCalls.set(callId, { resolve, reject, timeoutId });
    
    // Send to desktop
    const message = {
      type: 'EXECUTE_TOOL',
      callId,
      toolName: toolCall.function.name,
      arguments: JSON.parse(toolCall.function.arguments),
      timestamp: new Date().toISOString(),
    };
    
    try {
      targetConnection.ws.send(JSON.stringify(message));
      logger.info({ callId, toolName: message.toolName }, 'Sent tool execution request to desktop');
    } catch (err) {
      clearTimeout(timeoutId);
      pendingToolCalls.delete(callId);
      reject(new Error(`Failed to send to desktop: ${err.message}`));
    }
  });
}

/**
 * Handle tool result from desktop
 */
export function handleToolResult(callId, result, error = null) {
  const pending = pendingToolCalls.get(callId);
  
  if (!pending) {
    logger.warn({ callId }, 'Received result for unknown tool call');
    return;
  }
  
  clearTimeout(pending.timeoutId);
  pendingToolCalls.delete(callId);
  
  if (error) {
    pending.reject(new Error(error));
  } else {
    pending.resolve(result);
  }
}

/**
 * Process AI response that may contain tool calls
 * This is the main orchestration function
 */
export async function processAIResponseWithTools(userId, aiResponse, aiService, chatOptions) {
  // Check if AI wants to call tools
  if (!aiResponse.requiresToolExecution || !aiResponse.message.tool_calls) {
    return aiResponse;
  }
  
  logger.info({ 
    userId, 
    toolCallCount: aiResponse.message.tool_calls.length 
  }, 'AI requested tool execution');
  
  // Execute each tool call
  const toolResults = [];
  
  for (const toolCall of aiResponse.message.tool_calls) {
    try {
      logger.info({ 
        toolName: toolCall.function.name, 
        toolId: toolCall.id 
      }, 'Executing tool');
      
      const result = await executeToolOnDesktop(userId, toolCall);
      
      toolResults.push({
        tool_call_id: toolCall.id,
        role: 'tool',
        content: typeof result === 'string' ? result : JSON.stringify(result),
      });
      
      logger.info({ 
        toolName: toolCall.function.name, 
        success: true 
      }, 'Tool execution completed');
      
    } catch (err) {
      logger.error({ 
        toolName: toolCall.function.name, 
        error: err.message 
      }, 'Tool execution failed');
      
      toolResults.push({
        tool_call_id: toolCall.id,
        role: 'tool',
        content: JSON.stringify({ error: err.message }),
      });
    }
  }
  
  // Build updated messages with tool results
  const updatedMessages = [
    ...chatOptions.messages,
    {
      role: 'assistant',
      content: aiResponse.message.content || '',
      tool_calls: aiResponse.message.tool_calls,
    },
    ...toolResults,
  ];
  
  // Call AI again with tool results
  const finalResponse = await aiService.chat({
    ...chatOptions,
    messages: updatedMessages,
  });
  
  // Add tool execution info to response
  return {
    ...finalResponse,
    toolsExecuted: aiResponse.message.tool_calls.map(tc => tc.function.name),
  };
}

/**
 * MCP Orchestrator export
 */
export const MCPOrchestrator = {
  registerDesktopConnection,
  unregisterDesktopConnection,
  updateDesktopTools,
  getAvailableToolsForUser,
  hasActiveDesktop,
  executeToolOnDesktop,
  handleToolResult,
  processAIResponseWithTools,
  
  // Get connection stats
  getStats() {
    return {
      activeConnections: activeDesktopConnections.size,
      pendingToolCalls: pendingToolCalls.size,
    };
  },
};
