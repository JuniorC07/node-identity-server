import { z } from 'zod';

export const schema = z.object({
  authorization_request_token: z.string().min(1).max(512),
  decision: z.enum(['approve', 'deny']),
});
