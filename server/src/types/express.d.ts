import '@clerk/express';
import type { z } from 'zod';

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
    }
  }
}

export {};
