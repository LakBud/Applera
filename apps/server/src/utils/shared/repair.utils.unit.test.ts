import { describe, it, expect } from 'vitest';

import { dedupe, normalizeArray, normalizeString } from './repair.utils.js';

describe('normalizeString', () => {
  it('trims a normal string', () => {
    expect(normalizeString('  hello  ')).toBe('hello');
  });

  it('returns empty string unchanged', () => {
    expect(normalizeString('')).toBe('');
  });

  it.each([
    [123, ''],
    [null, ''],
    [undefined, ''],
    [{}, ''],
    [[], ''],
    [true, ''],
  ])('returns "" for non-string input: %p', (input, expected) => {
    expect(normalizeString(input)).toBe(expected);
  });
});

describe('normalizeArray', () => {
  it('trims, lowercases, and returns valid strings', () => {
    expect(normalizeArray(['  Foo ', 'BAR'])).toEqual(['foo', 'bar']);
  });

  it('filters out non-string items', () => {
    expect(normalizeArray(['a', 1, null, 'b', undefined, {}])).toEqual(['a', 'b']);
  });

  it('filters out empty/whitespace-only strings after trimming', () => {
    expect(normalizeArray(['  ', '', 'ok'])).toEqual(['ok']);
  });

  it('returns [] for non-array input', () => {
    expect(normalizeArray('not an array')).toEqual([]);
    expect(normalizeArray(null)).toEqual([]);
    expect(normalizeArray(undefined)).toEqual([]);
    expect(normalizeArray(42)).toEqual([]);
    expect(normalizeArray({})).toEqual([]);
  });

  it('returns [] for an empty array', () => {
    expect(normalizeArray([])).toEqual([]);
  });
});

describe('dedupe', () => {
  it('removes duplicate primitives', () => {
    expect(dedupe([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
  });

  it('preserves order of first occurrence', () => {
    expect(dedupe(['b', 'a', 'b', 'c', 'a'])).toEqual(['b', 'a', 'c']);
  });

  it('returns [] for empty input', () => {
    expect(dedupe([])).toEqual([]);
  });

  it('does not dedupe distinct object references (reference equality)', () => {
    const a = { x: 1 };
    const b = { x: 1 };
    expect(dedupe([a, b, a])).toEqual([a, b]);
  });
});
