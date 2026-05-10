import { Request, Response, NextFunction } from "express";
import multer from "multer";
// Configures multer for in-memory PDF uploads.
// Import the named exports to target specific form fields:
//
//   router.post("/cv",  uploadCV,  parseCvPdf,  cvController.uploadCV);
//   router.post("/job", uploadJob, parseJobPdf, jobController.analyzeJob);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const PDF_MIME = "application/pdf";
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46]); // % PDF

// ── File filter: reject anything that isn't a PDF ─────────────────────────────
// Defense in Depth: check both the MIME type AND the file magic bytes.
// MIME type alone is client-set and trivially spoofed (e.g. rename .exe → .pdf).

export function pdfOnly(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
  if (file.mimetype !== PDF_MIME) {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
  }

  // Magic byte check happens after upload in validatePdfMagic
  cb(null, true);
}

// Shared multer instance
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: pdfOnly,
});

// Named field uploaders
export const uploadCV = upload.single("cv");
export const uploadJob = upload.single("job");

// ── Magic Byte validation ──────────────────────────────────────────────────────
// Runs after multer has buffered the file. Rejects files whose first 4 bytes
// don't match the PDF signature even if the MIME type was correct.

export function validatePdfMagic(req: Request, res: Response, next: NextFunction): void {
  if (!req.file) return next();

  const header: Buffer = req.file.buffer.slice(0, 4);

  if (!header.equals(PDF_MAGIC)) {
    res.status(400).json({
      error: "Invalid file. Only real PDFs are accepted",
    });
    return;
  }

  next();
}

// ── Multer error handler ──────────────────────────────────────────────────────
// Drop this after uploadCV / uploadJob in any route that uses them.
// Express only calls 4-argument middleware when a previous middleware
// calls next(err), which multer does on file size / type violations.

export function handleUploadError(err: unknown, req: Request, res: Response, next: NextFunction): Response | void {
  if (!(err instanceof multer.MulterError)) return next(err);

  const messages: Record<string, string> = {
    LIMIT_FILE_SIZE: "File is too large. Maximum size is 5 MB.",
    LIMIT_UNEXPECTED_FILE: "Invalid file type. Only PDF files are accepted.",
  };

  const message = messages[err.code] ?? `Upload error: ${err.message}`;

  return res.status(400).json({ error: message });
}
