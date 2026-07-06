import { describe, expect, it } from 'vitest';

import { normalizeSeniority } from './seniority.utils.js';

describe('normalizeSeniority', () => {
  describe('exact keyword matches', () => {
    it.each([
      ['intern', 'intern'],
      ['junior', 'junior'],
      ['lead', 'lead'],
      ['senior', 'senior'],
      ['mid', 'mid'],
      ['intermediate', 'mid'],
      ['executive', 'executive'],
      ['c-level', 'executive'],
      ['cto', 'executive'],
      ['ceo', 'executive'],
    ])('maps "%s" to "%s"', (input, expected) => {
      expect(normalizeSeniority(input)).toBe(expected);
    });
  });

  describe('case insensitivity', () => {
    it.each([
      ['SENIOR', 'senior'],
      ['Junior', 'junior'],
      ['MiD', 'mid'],
      ['CEO', 'executive'],
    ])('normalizes "%s" to "%s"', (input, expected) => {
      expect(normalizeSeniority(input)).toBe(expected);
    });
  });

  describe('whitespace handling', () => {
    it('trims leading/trailing whitespace', () => {
      expect(normalizeSeniority('  senior  ')).toBe('senior');
    });

    it('matches keyword within a multi-word phrase', () => {
      expect(normalizeSeniority('senior software engineer')).toBe('senior');
    });

    it('collapses multiple internal spaces when tokenizing', () => {
      expect(normalizeSeniority('senior    engineer')).toBe('senior');
    });

    it('matches keyword regardless of position in phrase', () => {
      expect(normalizeSeniority('software engineer intern')).toBe('intern');
    });
  });

  describe('priority order when multiple keywords present', () => {
    it('returns "intern" over "junior" when both present (map order)', () => {
      expect(normalizeSeniority('junior intern')).toBe('intern');
    });

    it('returns "junior" over "lead" when both present (map order)', () => {
      expect(normalizeSeniority('junior lead')).toBe('junior');
    });

    it('returns "lead" over "senior" when both present (map order)', () => {
      expect(normalizeSeniority('lead senior')).toBe('lead');
    });

    it('returns "senior" over "mid" when both present (map order)', () => {
      expect(normalizeSeniority('senior mid')).toBe('senior');
    });

    it('returns "mid" over "executive" when both present (map order)', () => {
      expect(normalizeSeniority('mid executive')).toBe('mid');
    });
  });

  describe('unknown / unmatched input', () => {
    it('returns "unknown" for unrelated text', () => {
      expect(normalizeSeniority('software engineer')).toBe('unknown');
    });

    it('returns "unknown" for empty string', () => {
      expect(normalizeSeniority('')).toBe('unknown');
    });

    it('returns "unknown" for whitespace-only string', () => {
      expect(normalizeSeniority('   ')).toBe('unknown');
    });

    it('does not match a keyword as a substring of another word', () => {
      // "leadership" contains "lead" as a substring but is not the token "lead"
      expect(normalizeSeniority('leadership skills')).toBe('unknown');
    });

    it('does not match "midwest" as "mid"', () => {
      expect(normalizeSeniority('midwest regional manager')).toBe('unknown');
    });
  });

  describe('non-string input coercion', () => {
    it('coerces numbers via String()', () => {
      expect(normalizeSeniority(123)).toBe('unknown');
    });

    it('coerces null via String() to "null"', () => {
      expect(normalizeSeniority(null)).toBe('unknown');
    });

    it('coerces undefined via String() to "undefined"', () => {
      expect(normalizeSeniority(undefined)).toBe('unknown');
    });

    it('coerces boolean via String()', () => {
      expect(normalizeSeniority(true)).toBe('unknown');
    });

    it('coerces objects via String() to "[object Object]"', () => {
      expect(normalizeSeniority({})).toBe('unknown');
    });

    it('coerces arrays via String() by joining elements', () => {
      // String(['senior']) === 'senior'
      expect(normalizeSeniority(['senior'])).toBe('senior');
    });
  });
});
