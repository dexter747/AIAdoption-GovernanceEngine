/**
 * WebSocket Client for Desktop-Backend Communication
 *
 * Maintains a persistent connection to the Express backend for:
 * 1. Receiving tool execution requests from AI
 * 2. Sending tool execution results back
 * 3. Registering available MCP tools
 */

import { EventEmitter } from 'events';

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface ToolExecutionRequest {
  callId: string;
  toolName: string;
  arguments: Record<string, any>;
  timestamp: string;
}

export class BackendWebSocket extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private authToken: string | null = null;
  private deviceId: string;
  private isAuthenticated = false;
  private pingInterval: NodeJS.Timeout | null = null;
  private connectionId: string | null = null;

  constructor(backendUrl: string, deviceId: string) {
    super();
    // Convert http(s) to ws(s)
    this.url = backendUrl.replace(/^http/, 'ws') + '/ws/mcp';
    this.deviceId = deviceId;
  }

  /**
   * Connect to the backend WebSocket
   */
  connect(authToken: string): Promise<void> {
    this.authToken = authToken;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('[WS] Connected to backend');
          this.reconnectAttempts = 0;
          this.startPingInterval();

          // Authenticate immediately
          this.send({
            type: 'AUTHENTICATE',
            token: this.authToken,
            deviceId: this.deviceId,
          });

          resolve();
        };

        this.ws.onmessage = event => {
          try {
            const message = JSON.parse(event.data as string) as WebSocketMessage;
            this.handleMessage(message);
          } catch (err) {
            console.error('[WS] Failed to parse message:', err);
          }
        };

        this.ws.onclose = event => {
          console.log('[WS] Connection closed:', event.code, event.reason);
          this.stopPingInterval();
          this.isAuthenticated = false;
          this.emit('disconnected', { code: event.code, reason: event.reason });

          // Attempt reconnection
          this.scheduleReconnect();
        };

        this.ws.onerror = error => {
          console.error('[WS] Error:', error);
          this.emit('error', error);
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Disconnect from the backend
   */
  disconnect(): void {
    this.stopPingInterval();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.isAuthenticated = false;
    this.connectionId = null;
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    console.log('[WS] Received:', message.type);

    switch (message.type) {
      case 'CONNECTED':
        this.connectionId = message.connectionId;
        this.emit('connected', { connectionId: message.connectionId });
        break;

      case 'AUTHENTICATED':
        this.isAuthenticated = true;
        this.emit('authenticated', {
          userId: message.userId,
          connectionId: message.connectionId,
        });
        break;

      case 'AUTH_ERROR':
        this.emit('auth_error', { message: message.message });
        break;

      case 'EXECUTE_TOOL':
        // AI wants to execute an MCP tool
        this.emit('execute_tool', {
          callId: message.callId,
          toolName: message.toolName,
          arguments: message.arguments,
          timestamp: message.timestamp,
        } as ToolExecutionRequest);
        break;

      case 'TOOLS_REGISTERED':
        this.emit('tools_registered', { count: message.count });
        break;

      case 'PONG':
        // Heartbeat response
        break;

      case 'ERROR':
        this.emit('backend_error', { message: message.message });
        break;

      default:
        console.warn('[WS] Unknown message type:', message.type);
    }
  }

  /**
   * Send a message to the backend
   */
  send(message: WebSocketMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WS] Cannot send - not connected');
      return false;
    }

    this.ws.send(JSON.stringify(message));
    return true;
  }

  /**
   * Register available MCP tools with the backend
   */
  registerTools(tools: Array<{ name: string; description: string; inputSchema: any }>): boolean {
    if (!this.isAuthenticated) {
      console.warn('[WS] Cannot register tools - not authenticated');
      return false;
    }

    return this.send({
      type: 'REGISTER_TOOLS',
      tools,
    });
  }

  /**
   * Send tool execution result back to backend
   */
  sendToolResult(callId: string, result: any, error?: string): boolean {
    return this.send({
      type: 'TOOL_RESULT',
      callId,
      result,
      error,
    });
  }

  /**
   * Start ping interval for keepalive
   */
  private startPingInterval(): void {
    this.stopPingInterval();

    this.pingInterval = setInterval(() => {
      this.send({ type: 'PING' });
    }, 25000);
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WS] Max reconnection attempts reached');
      this.emit('max_reconnect_reached');
      return;
    }

    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    setTimeout(() => {
      if (this.authToken) {
        this.reconnectAttempts++;
        this.connect(this.authToken).catch(err => {
          console.error('[WS] Reconnection failed:', err);
        });
      }
    }, delay);
  }

  /**
   * Check if connected and authenticated
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN && this.isAuthenticated;
  }

  /**
   * Get connection status
   */
  getStatus(): { connected: boolean; authenticated: boolean; connectionId: string | null } {
    return {
      connected: this.ws?.readyState === WebSocket.OPEN || false,
      authenticated: this.isAuthenticated,
      connectionId: this.connectionId,
    };
  }
}

// Export singleton pattern helper
let instance: BackendWebSocket | null = null;

export function getBackendWebSocket(): BackendWebSocket | null {
  return instance;
}

export function createBackendWebSocket(backendUrl: string, deviceId: string): BackendWebSocket {
  if (instance) {
    instance.disconnect();
  }
  instance = new BackendWebSocket(backendUrl, deviceId);
  return instance;
}
