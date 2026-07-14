import { z } from 'zod';

export const APPLICATION_STATUSES = [
  'generated',
  'applied',
  'interviewing',
  'offered',
  'rejected',
  'withdrawn',
] as const;

export const ApplicationStatusSchema = z.enum(APPLICATION_STATUSES);

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
