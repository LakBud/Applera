import { Seniority } from '../../types/seniority.types.js';

export function normalizeSeniority(input: unknown): Seniority {
  const v = String(input).toLowerCase().trim();

  const map: Array<[Seniority, string[]]> = [
    ['intern', ['intern']],
    ['junior', ['junior']],
    ['lead', ['lead']],
    ['senior', ['senior']],
    ['mid', ['mid', 'intermediate']],
    ['executive', ['executive', 'c-level', 'cto', 'ceo']],
  ];

  for (const [level, keywords] of map) {
    if (keywords.some((kw) => v.includes(kw))) {
      return level;
    }
  }

  return 'unknown';
}
