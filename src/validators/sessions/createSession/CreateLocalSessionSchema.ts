import { z } from 'zod';

export const schema = z.object({
  identifier: z.string().min(10).max(255),
  password: z.string().max(255),
  ipAddress: z.union([z.ipv4(), z.ipv6()]).optional().nullable().default(null),
  userAgent: z
    .string()
    .trim()
    .transform((value) => value.slice(0, 1000))
    .nullable()
    .optional()
    .default(null),
});
