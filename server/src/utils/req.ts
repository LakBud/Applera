export function getParam(value: unknown): string {
  if (typeof value === "string") return value;
  throw new Error("Invalid route param");
}
