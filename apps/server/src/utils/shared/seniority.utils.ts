import type { Seniority } from '@applera/schemas';

export function normalizeSeniority(input: unknown): Seniority {
  const v = String(input).toLowerCase().trim();
  const words = v.split(/\s+/);

  const map: Array<[Seniority, string[]]> = [
    ['intern', ['intern']],
    ['junior', ['junior']],
    ['lead', ['lead']],
    ['senior', ['senior']],
    ['mid', ['mid', 'intermediate']],
    ['executive', ['executive', 'c-level', 'cto', 'ceo']],
  ];

  for (const [level, keywords] of map) {
    if (keywords.some((kw) => words.includes(kw))) {
      return level;
    }
  }

  return 'unknown';
}
