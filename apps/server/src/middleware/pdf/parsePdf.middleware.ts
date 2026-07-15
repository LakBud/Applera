import { extractTextFromPdf } from '../../lib/pdfParser.js';
import { BadRequestError } from '../../utils/errors/badRequest.error.js';

import type { NextFunction, Request, Response } from 'express';

const MIN_LENGTH = 50;

function parsePdf(label: 'cv' | 'job') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const file = req.file;

    if (!file) return next();

    if (!file.buffer) {
      return next(new BadRequestError(`Invalid ${label} upload: missing buffer`));
    }

    extractTextFromPdf(file.buffer)
      .then((text) => {
        const cleaned = text?.trim();

        if (!cleaned || cleaned.length < MIN_LENGTH) {
          return next(new BadRequestError(`${label} PDF is empty or unreadable`));
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
        next(new BadRequestError(`Failed to parse ${label} PDF`));
      });
  };
}

export const parseCvPdf = parsePdf('cv');
export const parseJobPdf = parsePdf('job');
