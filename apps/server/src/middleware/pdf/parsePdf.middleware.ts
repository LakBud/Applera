import { extractTextFromPdf } from '../../lib/pdfParser.js';

import type { NextFunction, Request, Response } from 'express';

const MIN_LENGTH = 50;

function parsePdf(label: 'cv' | 'job') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const file = req.file;

    if (!file) return next();

    if (!file.buffer) {
      res.status(400).json({ error: `Invalid ${label} upload: missing buffer` });
      return;
    }

    extractTextFromPdf(file.buffer)
      .then((text) => {
        const cleaned = text?.trim();

        if (!cleaned || cleaned.length < MIN_LENGTH) {
          res.status(400).json({ error: `${label} PDF is empty or unreadable` });
          return;
        }

        if (label === 'cv') {
          req.pdfText = cleaned;
          req.body ??= {};
          req.body.cvText ??= cleaned;
        } else {
          req.jobPdfText = cleaned;
          req.body ??= {};
          req.body.jobText ??= cleaned;
        }

        next();
      })
      .catch((err) => {
        console.error(`[parse${label}Pdf]`, err);
        res.status(400).json({ error: `Failed to parse ${label} PDF` });
      });
  };
}

export const parseCvPdf = parsePdf('cv');
export const parseJobPdf = parsePdf('job');
