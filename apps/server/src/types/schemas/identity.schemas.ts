import { z } from 'zod';

export const IdentitySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('guest'),
    id: z.string(),
  }),
  z.object({
    type: z.literal('user'),
    id: z.string(),
    plan: z.enum(['free', 'pro', 'enterprise', 'admin']).catch('free'),
  }),
]);

export type Identity = z.infer<typeof IdentitySchema>;
