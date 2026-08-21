import { z } from 'zod';

export const schema = z.object({
  grant_type: z.string().min(1).max(100),
  code: z.string().min(1).max(512),
  redirect_uri: z.string().min(1).max(2048),
  code_verifier: z.string().min(1).max(128),
  client_id: z.string().min(1).max(100).optional(),
  client_secret: z.string().min(1).max(512).optional(),
});
