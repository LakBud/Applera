export function normalizeArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) =>
    item
      .toLowerCase()
      .replace(/[\s.-]/g, "")
      .trim(),
  );
}
