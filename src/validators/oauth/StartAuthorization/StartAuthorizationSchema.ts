import { z } from 'zod';

export const schema = z.object({
  response_type: z.string().min(1).max(50),
  client_id: z.string().min(1).max(100),
  redirect_uri: z.string().min(1).max(2048),
  scope: z.string().min(1).max(1000),
  state: z.string().min(16).max(512),
  nonce: z.string().min(16).max(512).optional(),
  code_challenge: z.string().min(1).max(128),
  code_challenge_method: z.string().min(1).max(20),
});
