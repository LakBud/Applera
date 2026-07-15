import '@clerk/express';
import 'multer';
import { Identity } from './schemas/identity.schemas.js';

import type { RefundUsage, ReserveUsage } from './llm.types.js';

declare global {
  namespace Express {
    interface Request {
      identity?: Identity;
      requestId?: string;

      auth?: {
        userId?: string;
        plan?: 'free' | 'pro' | 'enterprise' | 'admin';
      };

      validated?: unknown;
      pdfText?: string;
      jobPdfText?: string;

      reserveUsage?: ReserveUsage;
      refundUsage?: RefundUsage;
    }
  }
}

export {};
