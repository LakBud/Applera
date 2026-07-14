import { z } from 'zod';

export const CONFIDENCE_LEVELS = ['low', 'medium', 'high'] as const;

export const ConfidenceSchema = z.enum(CONFIDENCE_LEVELS);

export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];
