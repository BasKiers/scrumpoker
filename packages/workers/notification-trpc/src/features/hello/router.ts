import { router } from '../../trpc';
import { publicProcedure } from '../../trpc';
import { helloInputSchema } from './schema';

export const helloRouter = router({
  hello: publicProcedure
    .input(helloInputSchema)
    .query(({ input }) => {
      return { greeting: `Hello, ${input.name ?? 'World'}!` };
    }),
}); 