import "@clerk/express";

declare global {
  namespace Express {
    interface Request {
      auth: {
        userId: string | null;
        sessionId: string | null;
        getToken: () => Promise<string | null>;
      };

      identity: {
        type: "user" | "guest";
        id: string;
      };
    }
  }
}

export {};
