import { Request, Response, NextFunction } from 'express';

export function concurrencyLimit(max: number) {
  if (max < 1) throw new Error('concurrencyLimit: max must be at least 1');

  let active = 0;

  return (_req: Request, res: Response, next: NextFunction) => {
    if (active >= max) {
      return res.status(503).json({
        error: 'Server is busy. Please try again in a moment.',
      });
    }

    active++;

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      active--;
    };

    res.on('finish', cleanup);
    res.on('close', cleanup);

    try {
      next();
    } catch (err) {
      cleanup();
      throw err;
    }
  };
}
