import { MAX_LENGTH } from "../../utils/utils.js";

/**
 * CV Text normalization for LLM ingestion
 */
export function repairCVText(raw: string): string {
  if (typeof raw !== "string") {
    throw new TypeError("[cvRepair] CV must be a string");
  }

  let text = raw.trim();

  // 1. normalize unicode noise (PDF/OCR fix)
  text = text.normalize("NFKC");

  // 2. remove invisible/control chars
  text = text.replace(/[\u0000-\u001F\u007F]/g, "");

  // 3. normalize whitespace
  text = text.replace(/\r/g, "");
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");

  // 4. remove common PDF/OCR noise
  text = text.replace(/page \d+ of \d+/gi, "");
  text = text.replace(/confidential/gi, "");

  // 5. normalize bullets
  text = text.replace(/[•●▪]/g, "-");

  // 6. fix spacing around punctuation
  text = text.replace(/\s+([,.!?])/g, "$1");

  // 7. smart truncate (DON’T cut mid-word)
  if (text.length > MAX_LENGTH) {
    const cut = text.lastIndexOf(" ", MAX_LENGTH);
    text = text.slice(0, cut > 0 ? cut : MAX_LENGTH);
  }

  return text.trim();
}
