import "@clerk/express";
import type { Identity } from "./identity.js";
import type { z } from "zod";

declare global {
  namespace Express {
    interface Request {
      identity?: Identity;
      requestId?: string;
      auth?: {
        userId?: string;
      };

      validated?: unknown;
    }
  }
}

export {};
