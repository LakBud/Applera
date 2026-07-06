import { SKILL_ALIASES } from './skills.aliases.js';

/**
 * Normalises a single skill string for comparison.
 * Domain-agnostic: only handles casing/whitespace/punctuation.
 * "Node.js" → "nodejs",  "React Native" → "reactnative"
 */
export function normalizeSkill(s: string): string {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[\s.\-_/]+/g, '');
}

/**
 * Normalises an array of skills. Removes duplicates after normalisation.
 */
export function normalizeSkills(arr: unknown): string[] {
  if (!Array.isArray(arr)) {
    return [];
  }

  return [...new Set(arr.map((s) => normalizeSkill(String(s))).filter(Boolean))];
}

// Equivalence (same skill, different name)

// built once at module load: every alias (and canonical) -> its canonical form.
// Uses Map rather than a plain object — with 4k+ lines of alias data pulled
// from an external source, an alias eventually colliding with an inherited
// Object.prototype property name (constructor, toString, valueOf, ...) is a
// real risk, not a theoretical one. Map has no prototype chain to collide
// with, so lookups are always exact.
const ALIAS_TO_CANONICAL = new Map<string, string>(
  Object.entries(SKILL_ALIASES).flatMap(([canonical, aliases]) => [
    [canonical, canonical] as [string, string],
    ...aliases.map((alias): [string, string] => [alias, canonical]),
  ]),
);

export function resolveCanonical(skill: string): string {
  return ALIAS_TO_CANONICAL.get(skill) ?? skill;
}

export function isJobSkillCovered(cvCanonicalSet: Set<string>, jobSkill: string): boolean {
  return cvCanonicalSet.has(resolveCanonical(normalizeSkill(jobSkill)));
}

/**
 * Expands a list of skills into the full set of their equivalent (canonical)
 * forms. Two skills that both resolve into this set for the same canonical
 * are the SAME skill, not just related ones.
 */
export function expandCanonicalSkills(skills: string[]): Set<string> {
  const expanded = new Set<string>();

  for (const raw of skills) {
    const normalized = normalizeSkill(raw);
    if (!normalized) continue;

    expanded.add(resolveCanonical(normalized));
  }

  return expanded;
}
