import { PDFParse } from "pdf-parse";

export async function extractTextFromPdfBuffer(buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return (result?.text || "").trim();
  } finally {
    await parser.destroy();
  }
}