export function isValidSeniority(value?: string) {
  if (!value) {
    return false;
  }
  return value !== 'unknown';
}
