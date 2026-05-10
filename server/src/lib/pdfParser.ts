import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const MIN_TEXT_LENGTH: number = 50;

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError("[pdfParser] expected Buffer, got " + typeof buffer);
  }

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
  });

  const pdf = await loadingTask.promise;

  let text: string = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const pageText = content.items.map((item: any) => item.str).join(" ");

    text += pageText + "\n";
  }

  const finalText: string = text.trim();

  if (finalText.length < MIN_TEXT_LENGTH) {
    throw new Error("[pdfParser] PDF seems scanned/image-based or empty.");
  }

  return finalText;
}
