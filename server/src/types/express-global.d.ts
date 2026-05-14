import "@clerk/express";

declare global {
  namespace Express {
    interface Request {
      identity?: {
        id: string;
        type: "user" | "guest";
        plan: "guest" | "free" | "pro" | "enterprise";
      };

      requestId?: string;

      auth?: {
        userId?: string;
      };
    }
  }
}

export {};
