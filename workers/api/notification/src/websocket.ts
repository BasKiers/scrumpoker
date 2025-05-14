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
  private sessions: Map<string, WebSocket>;
  private db: D1Database;
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  constructor(state: DurableObjectState, env: { DB: D1Database }) {
    this.state = state;
    this.sessions = new Map();
    this.db = env.DB;
    // Restore sessions from SQLite and clean up stale ones
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.db.prepare("SELECT * FROM sessions").all();
      if (stored && stored.results) {
        const now = Date.now();
        for (const row of stored.results) {
          const meta = {
            sessionId: row.sessionId as string,
            lastActivity: row.lastActivity as number,
          } as SessionMeta;
          // Only restore non-stale sessions
          if (now - meta.lastActivity < this.SESSION_TIMEOUT) {
            this.sessions.set(meta.sessionId, undefined as any);
          }
        }
      }
      // Clean up stale sessions
      await this.cleanupStaleSessions();
    });
  }

  async fetch(request: Request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    // Check for session resumption
    const url = new URL(request.url);
    const resumeSessionId = url.searchParams.get('sessionId');
    let sessionId: string;

    if (resumeSessionId && this.sessions.has(resumeSessionId)) {
      // Resume existing session
      sessionId = resumeSessionId;
    } else {
      // Create new session
      sessionId = crypto.randomUUID();
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];

    server.accept();
    this.sessions.set(sessionId, server);

    // Update session metadata
    this.state.waitUntil(this.updateSessionMetadata(sessionId));

    // Handle WebSocket messages
    server.addEventListener('message', async (event) => {
      try {
        const data = JSON.parse(event.data.toString());
        // Update last activity timestamp
        this.state.waitUntil(this.updateSessionMetadata(sessionId));
        
        // Handle different message types
        switch (data.type) {
          case 'ping':
            server.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;
          default:
            // Echo back the message
            server.send(event.data.toString());
        }
      } catch (error) {
        // If message is not JSON, echo it back as is
        server.send(event.data.toString());
      }
    });

    // Handle WebSocket close
    server.addEventListener('close', () => {
      this.sessions.delete(sessionId);
      this.state.waitUntil(this.persistSessions());
    });

    // Handle WebSocket errors
    server.addEventListener('error', () => {
      this.sessions.delete(sessionId);
      this.state.waitUntil(this.persistSessions());
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    } as ResponseInit);
  }

  private async updateSessionMetadata(sessionId: string) {
    const meta: SessionMeta = {
      sessionId,
      lastActivity: Date.now(),
    };
    await this.db.prepare(
      "INSERT OR REPLACE INTO sessions (sessionId, lastActivity) VALUES (?, ?)"
    ).bind(sessionId, meta.lastActivity).run();
  }

  private async cleanupStaleSessions() {
    const cutoff = Date.now() - this.SESSION_TIMEOUT;
    await this.db.prepare(
      "DELETE FROM sessions WHERE lastActivity < ?"
    ).bind(cutoff).run();
  }

  private async persistSessions() {
    // Clear existing sessions in SQLite
    await this.db.prepare("DELETE FROM sessions").run();
    // Insert current session IDs with metadata
    const now = Date.now();
    const stmt = this.db.prepare(
      "INSERT INTO sessions (sessionId, lastActivity) VALUES (?, ?)"
    );
    for (const sessionId of this.sessions.keys()) {
      await stmt.bind(sessionId, now).run();
    }
  }
} 