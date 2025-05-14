import { z } from 'zod';

export const connectInputSchema = z.object({
  id: z.string().min(1, 'ID is required'),
}); 