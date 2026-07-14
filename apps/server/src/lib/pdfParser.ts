import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const MIN_TEXT_LENGTH = 50;

type PDFTextItem = {
  str: string;
};

type ExtractPdfOptions = {
  signal?: AbortSignal;
};

function normalizePdfText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

export async function extractTextFromPdf(
  buffer: Buffer,
  options?: ExtractPdfOptions,
): Promise<string> {
  const signal = options?.signal;

  signal?.throwIfAborted();

  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError(`[pdfParser] expected Buffer, got ${typeof buffer}`);
  }

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
  });

  const abortHandler = () => {
    loadingTask.destroy().catch(() => {});
  };

  signal?.addEventListener('abort', abortHandler, { once: true });

  try {
    const pdf = await loadingTask.promise;

    signal?.throwIfAborted();

    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      signal?.throwIfAborted();

      const page = await pdf.getPage(i);

      try {
        signal?.throwIfAborted();

        const content = await page.getTextContent();

        signal?.throwIfAborted();

        const pageText = (content.items as PDFTextItem[]).map((item) => item.str).join(' ');

        text += pageText + '\n';
      } finally {
        page.cleanup();
      }
    }

    signal?.throwIfAborted();

    const finalText = normalizePdfText(text);

    if (finalText.length < MIN_TEXT_LENGTH) {
      throw new Error('[pdfParser] Low text output — likely scanned/image-based PDF');
    }

    return finalText;
  } finally {
    signal?.removeEventListener('abort', abortHandler);
    await loadingTask.destroy().catch(() => {});
  }
}
