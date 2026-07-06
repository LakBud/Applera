import { describe, it, expect } from 'vitest';

import { getParam } from './param.utils.js';

describe('getParam', () => {
  it('returns the string when value is a string', () => {
    expect(getParam('abc123')).toBe('abc123');
  });

  it('returns an empty string unchanged', () => {
    expect(getParam('')).toBe('');
  });

  it.each([
    [123],
    [null],
    [undefined],
    [{}],
    [[]],
    [true],
    [['abc']], // common Express edge case: repeated query params come as arrays
  ])('throws for non-string input: %p', (input) => {
    expect(() => getParam(input)).toThrow('Invalid route param');
  });
});
