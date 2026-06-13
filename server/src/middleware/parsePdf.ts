import type { NextFunction, Request, Response } from 'express';

import { extractTextFromPdf } from '../lib/pdfParser.js';

const MIN_LENGTH = 50;

// ─────────────────────────────────────────────
// CV PDF parser
// ─────────────────────────────────────────────

export function parseCvPdf(req: Request, res: Response, next: NextFunction): void {
  const file = req.file;

  if (!file) {
    next();
    return;
  }

  if (!file.buffer) {
    res.status(400).json({
      error: 'Invalid CV upload: missing buffer',
    });
    return;
  }

  extractTextFromPdf(file.buffer)
    .then((text) => {
      const cleaned = text?.trim();

      if (!cleaned || cleaned.length < MIN_LENGTH) {
        res.status(400).json({
          error: 'CV PDF is empty or unreadable',
        });
        return;
      }

      // attach parsed text
      (req as any).pdfText = cleaned;

      next();
    })
    .catch((err: unknown) => {
      console.error('[parseCvPdf]', err);

      res.status(400).json({
        error: 'Failed to parse CV PDF',
      });
    });
}

// ─────────────────────────────────────────────
// Job PDF parser
// ─────────────────────────────────────────────

export function parseJobPdf(req: Request, res: Response, next: NextFunction): void {
  const file = req.file;

  if (!file) {
    next();
    return;
  }

  if (!file.buffer) {
    res.status(400).json({
      error: 'Invalid Job upload: missing buffer',
    });
    return;
  }

  extractTextFromPdf(file.buffer)
    .then((text) => {
      const cleaned = text?.trim();

      if (!cleaned || cleaned.length < MIN_LENGTH) {
        res.status(400).json({
          error: 'Job PDF is empty or unreadable',
        });
        return;
      }

      // attach parsed text separately
      (req as any).jobPdfText = cleaned;

      next();
    })
    .catch((err: unknown) => {
      console.error('[parseJobPdf]', err);

      res.status(400).json({
        error: 'Failed to parse Job PDF',
      });
    });
}
