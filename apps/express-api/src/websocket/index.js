/**
 * WebSocket Handler for Desktop-Backend Communication
 * 
 * This module sets up WebSocket connections for:
 * 1. Desktop apps to connect and receive tool execution requests
 * 2. Real-time bi-directional communication for MCP tool calling
 */

import { WebSocketServer } from 'ws';
import { createLogger } from '../utils/logger.js';
import { MCPOrchestrator } from '../services/mcp-orchestrator.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

const logger = createLogger('websocket');

let wss = null;

/**
 * Initialize WebSocket server
 */
export function initializeWebSocket(server) {
  wss = new WebSocketServer({ 
    server,
    path: '/ws/mcp',
  });
  
  logger.info('WebSocket server initialized on /ws/mcp');
  
  wss.on('connection', handleConnection);
  
  // Heartbeat to detect dead connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        logger.info({ connectionId: ws.connectionId }, 'Terminating dead connection');
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
  
  wss.on('close', () => {
    clearInterval(interval);
  });
  
  return wss;
}

/**
 * Handle new WebSocket connection
 */
function handleConnection(ws, req) {
  ws.isAlive = true;
  ws.connectionId = `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  logger.info({ connectionId: ws.connectionId }, 'New WebSocket connection');
  
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleMessage(ws, message);
    } catch (err) {
      logger.error({ error: err.message }, 'Failed to parse WebSocket message');
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid JSON' }));
    }
  });
  
  ws.on('close', () => {
    logger.info({ connectionId: ws.connectionId, userId: ws.userId }, 'WebSocket connection closed');
    
    if (ws.userId) {
      MCPOrchestrator.unregisterDesktopConnection(ws.userId, ws.connectionId);
    }
  });
  
  ws.on('error', (err) => {
    logger.error({ connectionId: ws.connectionId, error: err.message }, 'WebSocket error');
  });
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'CONNECTED',
    connectionId: ws.connectionId,
    timestamp: new Date().toISOString(),
  }));
}

/**
 * Handle incoming WebSocket message
 */
function handleMessage(ws, message) {
  logger.debug({ type: message.type, connectionId: ws.connectionId }, 'Received WebSocket message');
  
  switch (message.type) {
    case 'AUTHENTICATE':
      handleAuthenticate(ws, message);
      break;
      
    case 'REGISTER_TOOLS':
      handleRegisterTools(ws, message);
      break;
      
    case 'TOOL_RESULT':
      handleToolResult(ws, message);
      break;
      
    case 'PING':
      ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
      break;
      
    default:
      logger.warn({ type: message.type }, 'Unknown message type');
      ws.send(JSON.stringify({ type: 'ERROR', message: `Unknown message type: ${message.type}` }));
  }
}

/**
 * Handle authentication message from desktop
 */
function handleAuthenticate(ws, message) {
  try {
    const { token, deviceId } = message;
    
    if (!token) {
      ws.send(JSON.stringify({ type: 'AUTH_ERROR', message: 'No token provided' }));
      return;
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    ws.userId = decoded.sub || decoded.userId;
    ws.deviceId = deviceId;
    
    // Register this desktop connection
    MCPOrchestrator.registerDesktopConnection(ws.userId, ws.connectionId, ws);
    
    logger.info({ userId: ws.userId, deviceId, connectionId: ws.connectionId }, 'Desktop authenticated');
    
    ws.send(JSON.stringify({
      type: 'AUTHENTICATED',
      userId: ws.userId,
      connectionId: ws.connectionId,
    }));
    
  } catch (err) {
    logger.error({ error: err.message }, 'Authentication failed');
    ws.send(JSON.stringify({ type: 'AUTH_ERROR', message: 'Invalid token' }));
  }
}

/**
 * Handle tool registration from desktop
 * Desktop sends available MCP tools when connected to databases
 */
function handleRegisterTools(ws, message) {
  if (!ws.userId) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Not authenticated' }));
    return;
  }
  
  const { tools } = message;
  
  if (!Array.isArray(tools)) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Tools must be an array' }));
    return;
  }
  
  // Update tools in orchestrator
  MCPOrchestrator.updateDesktopTools(ws.userId, ws.connectionId, tools);
  
  logger.info({ 
    userId: ws.userId, 
    toolCount: tools.length,
    toolNames: tools.map(t => t.name),
  }, 'Tools registered');
  
  ws.send(JSON.stringify({
    type: 'TOOLS_REGISTERED',
    count: tools.length,
  }));
}

/**
 * Handle tool execution result from desktop
 */
function handleToolResult(ws, message) {
  const { callId, result, error } = message;
  
  if (!callId) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Missing callId' }));
    return;
  }
  
  MCPOrchestrator.handleToolResult(callId, result, error);
  
  logger.info({ 
    callId, 
    hasError: !!error,
    userId: ws.userId,
  }, 'Tool result received');
}

/**
 * Broadcast to all authenticated connections of a user
 */
export function broadcastToUser(userId, message) {
  if (!wss) return;
  
  wss.clients.forEach((client) => {
    if (client.userId === userId && client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  });
}

/**
 * Get connection stats
 */
export function getWebSocketStats() {
  if (!wss) return { active: 0, authenticated: 0 };
  
  let authenticated = 0;
  wss.clients.forEach((client) => {
    if (client.userId) authenticated++;
  });
  
  return {
    active: wss.clients.size,
    authenticated,
  };
}
