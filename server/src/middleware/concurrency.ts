import { Request, Response, NextFunction } from "express";

export function concurrencyLimit(max: number) {
  let active = 0;

  function decrement() {
    active = Math.max(0, active - 1);
  }

  return (_req: Request, res: Response, next: NextFunction) => {
    if (active >= max) {
      return res.status(503).json({
        error: "Server is busy. Please try again in a moment.",
      });
    }

    active++;

    let finished = false;

    const cleanup = () => {
      if (finished) return;
      finished = true;
      decrement();
    };

    res.on("finish", cleanup);
    res.on("close", cleanup);

    next();
  };
}
