import { extractTextFromPdf } from '../lib/pdfParser.js';

export function isBuffer(value: unknown): value is Buffer {
  return Buffer.isBuffer(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function toText(input: Buffer | string, label: string): Promise<string> {
  if (isBuffer(input)) {
    console.info(`[pipeline] Extracting text from ${label} PDF...`);

    return extractTextFromPdf(input);
  }

  if (isString(input)) {
    return input.trim();
  }

  throw new TypeError(`[pipeline] "${label}" must be a non-empty string or PDF Buffer`);
}
