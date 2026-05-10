// Configures multer for in-memory PDF uploads.
// Import the named exports to target specific form fields:
//
//   router.post("/cv",  uploadCV,  parseCvPdf,  cvController.uploadCV);
//   router.post("/job", uploadJob, parseJobPdf, jobController.analyzeJob);

import multer from "multer";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// ── File filter: reject anything that isn't a PDF ─────────────────────────────

function pdfOnly(req, file, cb) {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
  }
}

// ── Shared multer instance ────────────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: pdfOnly,
});

// ── Named field uploaders ─────────────────────────────────────────────────────

export const uploadCV = upload.single("cv");
export const uploadJob = upload.single("job");

// ── Multer error handler ──────────────────────────────────────────────────────
// Drop this after uploadCV / uploadJob in any route that uses them.
// Express only calls 4-argument middleware when a previous middleware
// calls next(err), which multer does on file size / type violations.

export function handleUploadError(err, req, res, next) {
  if (!(err instanceof multer.MulterError)) return next(err); // not a multer error

  const messages = {
    LIMIT_FILE_SIZE: "File is too large. Maximum size is 5 MB.",
    LIMIT_UNEXPECTED_FILE: `Invalid file type. Only PDF files are accepted.`,
  };

  return res.status(400).json({ error: messages[err.code] ?? `Upload error: ${err.message}` });
}
