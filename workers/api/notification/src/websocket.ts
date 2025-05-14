import { DurableObjectState } from '@cloudflare/workers-types';

interface WebSocketPair {
  [key: string]: WebSocket;
}

interface SessionMeta {
  sessionId: string;
  // You can add more metadata here if needed
}

export class WebSocketDO implements DurableObject {
  private state: DurableObjectState;
  private sessions: Map<string, WebSocket>;
  private db: D1Database;

  constructor(state: DurableObjectState, env: { DB: D1Database }) {
    this.state = state;
    this.sessions = new Map();
    this.db = env.DB;
    // Restore sessions from SQLite (metadata only, not live sockets)
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.db.prepare("SELECT sessionId FROM sessions").all();
      if (stored && stored.results) {
        for (const row of stored.results) {
          // Sockets themselves cannot be restored, but we keep the session IDs
          this.sessions.set(row.sessionId as string, undefined as any);
        }
      }
    });
  }

  async fetch(request: Request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];

    // Accept the WebSocket connection
    server.accept();

    // Generate a unique session ID
    const sessionId = crypto.randomUUID();
    this.sessions.set(sessionId, server);

    // Persist session metadata using SQLite
    this.state.waitUntil(this.persistSessions());

    // Handle WebSocket messages
    server.addEventListener('message', async (event) => {
      // Relay the message back to the client
      server.send(event.data);
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

  private async persistSessions() {
    // Clear existing sessions in SQLite
    await this.db.prepare("DELETE FROM sessions").run();
    // Insert current session IDs
    const sessionIds = Array.from(this.sessions.keys());
    if (sessionIds.length > 0) {
      const stmt = this.db.prepare("INSERT INTO sessions (sessionId) VALUES (?)");
      for (const sessionId of sessionIds) {
        await stmt.bind(sessionId).run();
      }
    }
  }
} 