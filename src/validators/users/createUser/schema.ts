import { z } from 'zod';

export const schema = z.object({
  name: z.string().trim().min(2).max(255).optional().nullable().default(null),
  email: z.email().trim().max(255),
  username: z.string().trim().min(3).max(50),
  password: z
    .string({
      error: (issue) =>
        issue.input === undefined ? 'Password is required' : 'Password must be a string',
    })
    .min(12, 'Password must have at least 12 characters')
    .refine((password) => Buffer.byteLength(password, 'utf8') <= 72, {
      message: 'Password must have at most 72 bytes',
    }),
});
