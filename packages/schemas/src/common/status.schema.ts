import { z } from 'zod';

export const ApplicationStatusSchema = z.enum([
  'generated',
  'applied',
  'interviewing',
  'offered',
  'rejected',
  'withdrawn',
]);

export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;
