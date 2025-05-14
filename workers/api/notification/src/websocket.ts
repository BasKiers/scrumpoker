import { DurableObjectState } from '@cloudflare/workers-types';

interface WebSocketPair {
  [key: string]: WebSocket;
}

export class WebSocketDO implements DurableObject {
  private state: DurableObjectState;
  private sessions: Map<string, WebSocket>;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.sessions = new Map();
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

    // Handle WebSocket messages
    server.addEventListener('message', async (event) => {
      // Relay the message back to the client
      server.send(event.data);
    });

    // Handle WebSocket close
    server.addEventListener('close', () => {
      this.sessions.delete(sessionId);
    });

    // Handle WebSocket errors
    server.addEventListener('error', () => {
      this.sessions.delete(sessionId);
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    } as ResponseInit);
  }
} 