import { z } from 'zod';

export const schema = z.object({
  name: z.string().trim().min(1).max(150),
  type: z.enum(['public', 'confidential']),
  redirectUris: z.array(z.string().trim().pipe(z.url())).min(1),
  allowedScopes: z.array(z.string().trim()).min(1),
});
