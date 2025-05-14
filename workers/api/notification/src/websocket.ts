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

  constructor(state: DurableObjectState) {
    this.state = state;
    this.sessions = new Map();
    // Restore sessions from storage (metadata only, not live sockets)
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<SessionMeta[]>("sessions");
      if (stored) {
        for (const meta of stored) {
          // Sockets themselves cannot be restored, but we keep the session IDs
          this.sessions.set(meta.sessionId, undefined as any);
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

    // Persist session metadata
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
    // Only store session IDs (not sockets)
    const sessionMeta: SessionMeta[] = Array.from(this.sessions.keys()).map(sessionId => ({ sessionId }));
    await this.state.storage.put("sessions", sessionMeta);
  }
} 