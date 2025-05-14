import { DurableObjectState } from '@cloudflare/workers-types';

interface WebSocketPair {
  [key: string]: WebSocket;
}

interface SessionMeta {
  sessionId: string;
  lastActivity: number;
  metadata?: Record<string, unknown>;
}

export class WebSocketDO implements DurableObject {
  private state: DurableObjectState;
  private db: D1Database;
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  constructor(state: DurableObjectState, env: { DB: D1Database }) {
    this.state = state;
    this.db = env.DB;
    // Initialize the database if needed
    this.state.blockConcurrencyWhile(async () => {
      try {
        await this.db.prepare(`
          CREATE TABLE IF NOT EXISTS sessions (
            sessionId TEXT PRIMARY KEY,
            lastActivity INTEGER NOT NULL
          )
        `).run();
        await this.cleanupStaleSessions();
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    });
  }

  async fetch(request: Request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    // Check for session resumption
    const url = new URL(request.url);
    const resumeSessionId = url.searchParams.get('sessionId');
    const sessionId = resumeSessionId || crypto.randomUUID();

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];

    // Use state.acceptWebSocket for proper hibernation
    this.state.acceptWebSocket(server);

    // Update session metadata
    this.state.waitUntil(this.updateSessionMetadata(sessionId));

    return new Response(null, {
      status: 101,
      webSocket: client,
    } as ResponseInit);
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    try {
      const data = JSON.parse(message.toString());
      // Update last activity timestamp
      this.state.waitUntil(this.updateSessionMetadata(ws.toString()));
      
      // Handle different message types
      switch (data.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
        default:
          // Echo back the message
          ws.send(message.toString());
      }
    } catch (error) {
      // If message is not JSON, echo it back as is
      ws.send(message.toString());
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    // Clean up the session
    this.state.waitUntil(this.cleanupSession(ws.toString()));
    ws.close(code, "Durable Object is closing WebSocket");
  }

  private async updateSessionMetadata(sessionId: string) {
    try {
      const meta: SessionMeta = {
        sessionId,
        lastActivity: Date.now(),
      };
      await this.db.prepare(
        "INSERT OR REPLACE INTO sessions (sessionId, lastActivity) VALUES (?, ?)"
      ).bind(sessionId, meta.lastActivity).run();
    } catch (error) {
      console.error('Failed to update session metadata:', error);
    }
  }

  private async cleanupSession(sessionId: string) {
    try {
      await this.db.prepare(
        "DELETE FROM sessions WHERE sessionId = ?"
      ).bind(sessionId).run();
    } catch (error) {
      console.error('Failed to cleanup session:', error);
    }
  }

  private async cleanupStaleSessions() {
    try {
      const cutoff = Date.now() - this.SESSION_TIMEOUT;
      await this.db.prepare(
        "DELETE FROM sessions WHERE lastActivity < ?"
      ).bind(cutoff).run();
    } catch (error) {
      console.error('Failed to cleanup stale sessions:', error);
    }
  }
} 