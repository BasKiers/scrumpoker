/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import {
	RoomState,
	validateWebSocketEvent,
	StateSyncResponse,
	ValidatedWebSocketEvent,
	EventBroadcastResponse,
	handleEvent,
	SuccessResponse,
	ToggleCardsEvent,
	ConnectEvent,
	DisconnectEvent,
} from 'shared-types';

export interface Env {
	WEBSOCKET_HIBERNATION_SERVER: DurableObjectNamespace;
}

export default {
	async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname.endsWith('/websocket')) {
			const upgradeHeader = request.headers.get('Upgrade');
			if (!upgradeHeader || upgradeHeader !== 'websocket') {
				return new Response('Durable Object expected Upgrade: websocket', { status: 426 });
			}

			// Get roomId from URL path
			const roomId = url.pathname.split('/')[2] || 'default';
			const id = env.WEBSOCKET_HIBERNATION_SERVER.idFromName(roomId);
			const stub = env.WEBSOCKET_HIBERNATION_SERVER.get(id);
			return stub.fetch(request);
		}
		return new Response('Not found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;

export class WebSocketHibernationServer implements DurableObject {
	private ctx: DurableObjectState;
	private env: Env;
	private roomState: RoomState;

	constructor(ctx: DurableObjectState, env: Env) {
		this.ctx = ctx;
		this.env = env;
		this.roomState = {
			roomId: ctx.id.toString(),
			participants: {},
			card_status: 'hidden',
		};

		// Initialize SQLite tables and load state
		this.ctx.blockConcurrencyWhile(async () => {
			// Create tables if they don't exist
			this.ctx.storage.sql.exec(`
				CREATE TABLE IF NOT EXISTS room_state (
					room_id TEXT PRIMARY KEY,
					card_status TEXT NOT NULL
				);

				CREATE TABLE IF NOT EXISTS participants (
					user_id TEXT NOT NULL,
					room_id TEXT NOT NULL,
					name TEXT,
					selected_card TEXT,
					last_event_timestamp INTEGER,
					PRIMARY KEY (user_id, room_id),
					FOREIGN KEY (room_id) REFERENCES room_state(room_id)
				);
			`);

			// Load room state
			const [roomStateResult] = this.ctx.storage.sql
				.exec<{ room_id: string; card_status: string }>('SELECT * FROM room_state WHERE room_id = ?', this.roomState.roomId)
				.toArray();

			if (roomStateResult) {
				this.roomState.card_status = roomStateResult.card_status as 'hidden' | 'revealed';
			} else {
				// Initialize room state
				this.ctx.storage.sql.exec(
					'INSERT INTO room_state (room_id, card_status) VALUES (?, ?)',
					this.roomState.roomId,
					this.roomState.card_status,
				);
			}

			// Load only connected participants
			const connectedParticipants = this.connectedParticipantsSet;
			const participantsResult = this.ctx.storage.sql
				.exec<{
					user_id: string;
					name: string | null;
					selected_card: string | null;
					last_event_timestamp: number | null;
				}>('SELECT user_id, name, selected_card, last_event_timestamp FROM participants WHERE room_id = ?', this.roomState.roomId)
				.toArray()
				.filter(({ user_id }) => connectedParticipants.has(user_id));

			this.roomState.participants = participantsResult.reduce(
				(acc, p) => ({
					...acc,
					[p.user_id]: {
						userId: p.user_id,
						name: p.name || undefined,
						selectedCard: p.selected_card || undefined,
						lastEventTimestamp: p.last_event_timestamp || undefined,
					},
				}),
				{},
			);
		});
	}

	private get connectedParticipantsSet() {
		const connectedParticipants = new Set(
			this.ctx.getWebSockets().map((ws) => {
				const [userId] = this.ctx.getTags(ws);
				return userId;
			}),
		);
		return connectedParticipants;
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const userId = url.searchParams.get('userId');
		if (!userId) {
			return new Response('Missing userId', { status: 400 });
		}

		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		const existingParticipant = this.ctx.storage.sql
			.exec<{
				user_id: string;
				connected: number;
				name?: string | null;
				selected_card?: string | null;
				last_event_timestamp?: number | null;
			}>(
				'SELECT user_id, name, selected_card, last_event_timestamp FROM participants WHERE user_id = ? AND room_id = ?',
				userId,
				this.roomState.roomId,
			)
			.toArray()[0];

		if (!existingParticipant) {
			this.ctx.storage.sql.exec('INSERT INTO participants (user_id, room_id) VALUES (?, ?)', userId, this.roomState.roomId);
		}

		const participant = existingParticipant
			? {
					userId: existingParticipant.user_id,
					name: existingParticipant.name ?? undefined,
					selectedCard: existingParticipant.selected_card ?? undefined,
					lastEventTimestamp: existingParticipant.last_event_timestamp ?? undefined,
				}
			: { userId };

		const event: ConnectEvent = {
			type: 'connect',
			...participant,
		};

		this.roomState = handleEvent(this.roomState, event);
		this.broadcast(event);

		// Accept the server end for hibernation
		this.ctx.acceptWebSocket(server, [userId]);

		// Send current state to the new connection (only connected participants)
		server.send(
			JSON.stringify({
				type: 'state_sync',
				state: this.roomState,
			} as StateSyncResponse),
		);

		return new Response(null, { status: 101, webSocket: client });
	}

	async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
		try {
			const rawData = JSON.parse(message as string);
			const validationResult = validateWebSocketEvent(rawData);

			if (!validationResult.success) {
				console.error('Invalid message format:', validationResult.error);
				ws.send(
					JSON.stringify({
						type: 'error',
						message: 'Invalid message format',
						details: validationResult.error.errors,
					}),
				);
				return;
			}

			this.roomState = handleEvent(this.roomState, validationResult.data);

			// Update SQLite storage based on event type
			this.updateStorageForEvent(validationResult.data);

			this.broadcast(validationResult.data, ws);

			// --- AUTO-REVEAL LOGIC ---
			if (validationResult.data.type === 'select_card' && this.roomState.card_status === 'hidden') {
				const namedParticipants = Object.values(this.roomState.participants).filter((p) => p.name);
				const allSelected = namedParticipants.length > 0 && namedParticipants.every((p) => p.selectedCard);
				if (allSelected) {
					const event: ToggleCardsEvent = {
						type: 'toggle_cards',
						value: 'revealed',
					};
					this.roomState = handleEvent(this.roomState, event);
					this.updateStorageForEvent(event);
					this.broadcast(event);
				}
			}

			ws.send(
				JSON.stringify({
					type: 'success',
					eventType: validationResult.data.type,
				} as SuccessResponse),
			);
		} catch (err) {
			console.error('Error handling message:', err);
			ws.send(
				JSON.stringify({
					type: 'error',
					message: err instanceof Error ? err.message : 'Unknown error',
				}),
			);
		}
	}

	async webSocketClose(ws: WebSocket, _code: number, _reason: string, _wasClean: boolean) {
		// Check if this was the last connection for this userId
		const [userId] = this.ctx.getTags(ws);
		if (this.ctx.getWebSockets(userId).length === 1) {
			const event: DisconnectEvent = { type: 'disconnect', userId };
			try {
				this.roomState = handleEvent(this.roomState, event);
				this.updateStorageForEvent(event);
				this.broadcast(event, ws);
			} catch (error) {
				console.error('Error handling disconnect:', error);
			}
		}
	}

	private updateStorageForEvent(event: ValidatedWebSocketEvent) {
		switch (event.type) {
			case 'select_card':
				this.ctx.storage.sql.exec(
					'UPDATE participants SET selected_card = ?, last_event_timestamp = ? WHERE user_id = ? AND room_id = ?',
					event.cardValue,
					Date.now(),
					event.userId,
					this.roomState.roomId,
				);
				break;
			case 'set_name':
				this.ctx.storage.sql.exec(
					'UPDATE participants SET name = ?, last_event_timestamp = ? WHERE user_id = ? AND room_id = ?',
					event.name,
					Date.now(),
					event.userId,
					this.roomState.roomId,
				);
				break;
			case 'toggle_cards':
				this.ctx.storage.sql.exec('UPDATE room_state SET card_status = ? WHERE room_id = ?', event.value, this.roomState.roomId);
				break;
			case 'reset':
				this.ctx.storage.sql.exec(
					'UPDATE participants SET selected_card = NULL WHERE room_id = ? AND selected_card IS NOT NULL',
					this.roomState.roomId,
				);
				this.ctx.storage.sql.exec('UPDATE room_state SET card_status = ? WHERE room_id = ?', 'hidden', this.roomState.roomId);
				break;
		}
	}

	private broadcast(message: ValidatedWebSocketEvent, excludeWebSocket?: WebSocket) {
		const serialized = JSON.stringify({
			type: 'event_broadcast',
			message,
		} as EventBroadcastResponse);
		for (const ws of this.ctx.getWebSockets()) {
			ws.send(serialized);
		}
	}
}
