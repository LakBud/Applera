import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const MIN_TEXT_LENGTH = 50;

type PDFTextItem = {
  str: string;
};

function normalizePdfText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError(`[pdfParser] expected Buffer, got ${typeof buffer}`);
  }

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
  });

  const pdf = await loadingTask.promise;

  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);

    try {
      const content = await page.getTextContent();

      const pageText = (content.items as PDFTextItem[]).map((item) => item.str).join(' ');

      text += pageText + '\n';
    } finally {
      page.cleanup();
    }
  }

  const finalText = normalizePdfText(text);

  if (finalText.length < MIN_TEXT_LENGTH) {
    throw new Error('[pdfParser] Low text output — likely scanned/image-based PDF');
  }

  return finalText;
}
