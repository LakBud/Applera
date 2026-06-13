import '@clerk/express';
import 'multer';

import type { Identity } from './identity.js';

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
    }
  }
}

export {};
