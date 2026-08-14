import { z } from 'zod';

export const schema = z.object({
  authorizationRequestToken: z.string().min(1).max(64),
});
