export function normalizeString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function normalizeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

export function dedupe<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}
