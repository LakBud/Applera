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

function buildAliasMap(skillAliases: Record<string, string[]>): Map<string, string> {
  const map = new Map<string, string>();
  const conflicts: string[] = [];

  const tryAdd = (key: string, canonical: string, source: string) => {
    const existing = map.get(key);
    if (existing !== undefined && existing !== canonical) {
      conflicts.push(`"${key}" (from ${source}) maps to both "${existing}" and "${canonical}"`);
      return;
    }
    map.set(key, canonical);
  };

  for (const [canonical, aliases] of Object.entries(skillAliases)) {
    tryAdd(canonical, canonical, 'canonical');
    for (const alias of aliases) {
      tryAdd(alias, canonical, `alias of "${canonical}"`);
    }
  }

  if (conflicts.length > 0) {
    throw new Error(
      `SKILL_ALIASES has ${conflicts.length} alias collision(s):\n` +
        conflicts.map((c) => `  - ${c}`).join('\n'),
    );
  }

  return map;
}

const ALIAS_TO_CANONICAL = buildAliasMap(SKILL_ALIASES);

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

  if (!Array.isArray(skills)) {
    return expanded;
  }

  for (const raw of skills) {
    const normalized = normalizeSkill(raw);
    if (!normalized) continue;

    expanded.add(resolveCanonical(normalized));
  }

  return expanded;
}

export function expandCanonicalSkillsWithDisplay(skills: string[]): {
  canonicalSet: Set<string>;
  displayMap: Map<string, string>;
} {
  const canonicalSet = expandCanonicalSkills(skills);
  const displayMap = new Map<string, string>();

  if (!Array.isArray(skills)) {
    return { canonicalSet, displayMap };
  }

  for (const raw of skills) {
    const original = String(raw ?? '').trim();
    if (!original) continue;

    const canonical = resolveCanonical(normalizeSkill(original));

    if (!displayMap.has(canonical)) {
      displayMap.set(canonical, original);
    }
  }

  return { canonicalSet, displayMap };
}
