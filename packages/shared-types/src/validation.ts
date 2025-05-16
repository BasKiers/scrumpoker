import { z } from 'zod';

// Base schema for all events
export const baseEventSchema = z.object({
  type: z.string(),
  eventId: z.string().optional(),
});

// Connect event schema
export const connectEventSchema = baseEventSchema.extend({
  type: z.literal('connect'),
  userId: z.string(),
  name: z.string().optional(),
});

// Disconnect event schema
export const disconnectEventSchema = baseEventSchema.extend({
  type: z.literal('disconnect'),
  userId: z.string(),
});

// Select card event schema
export const selectCardEventSchema = baseEventSchema.extend({
  type: z.literal('select_card'),
  userId: z.string(),
  cardValue: z.string(),
});

// Set name event schema
export const setNameEventSchema = baseEventSchema.extend({
  type: z.literal('set_name'),
  userId: z.string(),
  name: z.string(),
});

// Toggle cards event schema
export const toggleCardsEventSchema = baseEventSchema.extend({
  type: z.literal('toggle_cards'),
  value: z.enum(['hidden', 'revealed']),
});

// Reset event schema
export const resetEventSchema = baseEventSchema.extend({
  type: z.literal('reset'),
});

// Combined schema for all possible events
export const webSocketEventSchema = z.discriminatedUnion('type', [
  connectEventSchema,
  disconnectEventSchema,
  selectCardEventSchema,
  setNameEventSchema,
  toggleCardsEventSchema,
  resetEventSchema,
]);

// Type for validated WebSocket events
export type ValidatedWebSocketEvent = z.infer<typeof webSocketEventSchema>;

// Helper function to validate a WebSocket event
export function validateWebSocketEvent(
  data: unknown,
): { success: true; data: ValidatedWebSocketEvent } | { success: false; error: z.ZodError } {
  const result = webSocketEventSchema.safeParse(data);
  return result;
}

// Response schemas
export const successResponseSchema = z.object({
  type: z.literal('success'),
  eventType: z.string(),
  message: z.string().optional(),
});

export const errorResponseSchema = z.object({
  type: z.literal('error'),
  eventType: z.string(),
  error: z.string(),
  code: z.string().optional(),
});

export const stateUpdateResponseSchema = z.object({
  type: z.literal('state_update'),
  state: z.object({
    roomId: z.string(),
    participants: z.record(
      z.object({
        userId: z.string(),
        name: z.string().optional(),
        selectedCard: z.string().optional(),
      }),
    ),
    card_status: z.enum(['hidden', 'revealed']),
  }),
});

// Combined schema for all possible responses
export const webSocketResponseSchema = z.discriminatedUnion('type', [
  successResponseSchema,
  errorResponseSchema,
  stateUpdateResponseSchema,
]);

// Type for validated WebSocket responses
export type ValidatedWebSocketResponse = z.infer<typeof webSocketResponseSchema>;

// Helper function to validate a WebSocket response
export function validateWebSocketResponse(
  data: unknown,
): { success: true; data: ValidatedWebSocketResponse } | { success: false; error: z.ZodError } {
  const result = webSocketResponseSchema.safeParse(data);
  return result;
}
