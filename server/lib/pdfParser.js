// Extracts plain text from a PDF buffer.
// The original code used `new PDFParse()` which is incorrect —
// pdf-parse exports a function, not a class.

import * as pdfParse from "pdf-parse";

const MIN_TEXT_LENGTH = 50; // anything shorter is almost certainly a scanned/image PDF

/**
 * @param {Buffer} buffer  Raw PDF file buffer (e.g. from multer, fs.readFile)
 * @returns {Promise<string>} Extracted plain text, trimmed
 */
export async function extractTextFromPdf(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError("[pdfParser] expected a Buffer, got " + typeof buffer);
  }

  const result = await pdfParse(buffer);
  const text = result?.text?.trim() ?? "";

  if (text.length < MIN_TEXT_LENGTH) {
    throw new Error(
      "[pdfParser] Extracted text is too short — the PDF may be scanned or image-only. " +
        "Please provide a text-based PDF or paste the content as plain text.",
    );
  }

  return text;
}
