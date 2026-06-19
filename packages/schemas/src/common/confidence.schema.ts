import { z } from 'zod';

export const ConfidenceSchema = z.enum(['high', 'medium', 'low']);
