import { z } from 'zod';

export const helloInputSchema = z.object({
  name: z.string().optional(),
}); 