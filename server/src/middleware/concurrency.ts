import { Request, Response, NextFunction } from "express";

export function concurrencyLimit(max: number) {
  let active = 0;

  return (_req: Request, res: Response, next: NextFunction) => {
    if (active >= max) {
      return res.status(503).json({
        error: "Server is busy. Please try again in a moment.",
      });
    }
    active++;
    res.on("finish", () => active--);
    res.on("close", () => active--);

    next();
  };
}
