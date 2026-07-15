import multer from 'multer';

import { BadRequestError, MulterUploadError } from '../../utils/errors/badRequest.error.js';

import type { NextFunction, Request, Response } from 'express';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const PDF_MIME = 'application/pdf';
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF

// ── File filter ─────────────────────────────────────────────

export function pdfOnly(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void {
  if (file.mimetype !== PDF_MIME) {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
    return;
  }

  cb(null, true);
}

// ── Multer instance ─────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: pdfOnly,
});

// ── Named uploaders ─────────────────────────────────────────

export const uploadCV = upload.single('cv');
export const uploadJob = upload.single('job');

// ── PDF magic validation ─────────────────────────────────────

export function validatePdfMagic(req: Request, res: Response, next: NextFunction): void {
  if (!req.file?.buffer) {
    return next();
  }

  const header = req.file.buffer.subarray(0, 4);

  if (!header.equals(PDF_MAGIC)) {
    throw new BadRequestError('Invalid file. Only real PDFs are accepted');
  }

  next();
}

// ── Error handler ────────────────────────────────────────────

export function handleUploadError(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): Response | void {
  if (!(err instanceof multer.MulterError)) {
    return next(err);
  }

  const messages: Record<string, string> = {
    LIMIT_FILE_SIZE: 'File is too large. Maximum size is 5 MB.',
    LIMIT_UNEXPECTED_FILE: 'Invalid file type. Only PDF files are accepted.',
  };

  next(new MulterUploadError(messages[err.code] ?? 'Upload error', err.code));
}
