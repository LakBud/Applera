import { z } from 'zod';

// Shared

export const ConfidenceSchema = z.enum(['high', 'medium', 'low']);

export const SuccessStatusSchema = z.enum(['applied', 'interviewing', 'offered']);

export type SuccessStatus = z.infer<typeof SuccessStatusSchema>;
