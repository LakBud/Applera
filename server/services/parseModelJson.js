export function parseModelJson(text) {
  try {
    if (!text) throw new Error("Empty response");

    let cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("No JSON found");
    }

    cleaned = cleaned.slice(start, end + 1);

    // SAFETY: remove stray backticks
    cleaned = cleaned.replace(/`/g, '"');

    return JSON.parse(cleaned);
  } catch (err) {
    console.log("RAW MODEL OUTPUT:", text);
    throw new Error("Model returned invalid JSON");
  }
}
