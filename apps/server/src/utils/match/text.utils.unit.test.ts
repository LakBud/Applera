import { describe, expect, it } from 'vitest';

import { getConfidenceLevel } from './text.utils.js';

describe('getConfidenceLevel', () => {
  it('returns high for a strong match scenario', () => {
    expect(
      getConfidenceLevel({
        cvSkills: ['a', 'b', 'c'],
        jobSkills: ['a', 'b', 'c', 'd'],
        textScore: 20,
      }),
    ).toBe('high');
  });

  it('returns low for fully empty input (all three penalties stack: 100-20-20-25=35)', () => {
    expect(getConfidenceLevel({})).toBe('low');
  });

  it('cvSkills threshold boundary (2 → -20 penalty, still high; 3 → no penalty, high)', () => {
    const under = getConfidenceLevel({
      cvSkills: ['a', 'b'],
      jobSkills: ['a', 'b', 'c', 'd'],
      textScore: 20,
    });

    const ok = getConfidenceLevel({
      cvSkills: ['a', 'b', 'c'],
      jobSkills: ['a', 'b', 'c', 'd'],
      textScore: 20,
    });

    // A single penalty (-20) only drops confidence to 80, still >= 75 ('high').
    // This boundary doesn't cross a tier on its own — documenting that explicitly
    // rather than implying 'low' is somehow involved.
    expect(under).toBe('high');
    expect(ok).toBe('high');
  });

  it('jobSkills threshold boundary (3 → -20 penalty, still high; 4 → no penalty, high)', () => {
    const under = getConfidenceLevel({
      cvSkills: ['a', 'b', 'c'],
      jobSkills: ['a', 'b', 'c'],
      textScore: 20,
    });

    const ok = getConfidenceLevel({
      cvSkills: ['a', 'b', 'c'],
      jobSkills: ['a', 'b', 'c', 'd'],
      textScore: 20,
    });

    expect(under).toBe('high'); // 100 - 20 = 80, still >= 75
    expect(ok).toBe('high');
  });

  it('textScore boundary (14 → -25 penalty lands exactly on 75, still high; 15 → no penalty)', () => {
    const low = getConfidenceLevel({
      cvSkills: ['a', 'b', 'c'],
      jobSkills: ['a', 'b', 'c', 'd'],
      textScore: 14,
    });

    const ok = getConfidenceLevel({
      cvSkills: ['a', 'b', 'c'],
      jobSkills: ['a', 'b', 'c', 'd'],
      textScore: 15,
    });

    // 100 - 25 = 75, and the >= 75 threshold is inclusive, so this still resolves
    // to 'high'. If the threshold were ever changed to exclusive (> 75), this
    // assertion would need to flip to 'medium' — that's exactly what this test
    // now guards against silently regressing.
    expect(low).toBe('high');
    expect(ok).toBe('high');
  });

  it('always degrades confidence when inputs get worse', () => {
    const good = getConfidenceLevel({
      cvSkills: ['a', 'b', 'c'],
      jobSkills: ['a', 'b', 'c', 'd'],
      textScore: 20,
    });

    const worse = getConfidenceLevel({
      cvSkills: [],
      jobSkills: [],
      textScore: 0,
    });

    expect(good).toBe('high');
    expect(worse).toBe('low'); // 100 - 20 - 20 - 25 = 35, which is < 40

    const order = ['low', 'medium', 'high'];
    expect(order.indexOf(worse)).toBeLessThanOrEqual(order.indexOf(good));
  });

  it('handles missing fields safely', () => {
    // Each case below has two of three fields defaulted to empty/0,
    // so two penalties stack: 100 - 20 - 25 = 55, or 100 - 20 - 20 = 60.
    // Both land in the 'medium' band (>= 40, < 75), not 'high'.
    expect(getConfidenceLevel({ jobSkills: ['a', 'b', 'c', 'd'] })).toBe('medium');
    expect(getConfidenceLevel({ cvSkills: ['a', 'b', 'c'] })).toBe('medium');
    expect(getConfidenceLevel({ textScore: 20 })).toBe('medium');
  });

  it('reaches low tier only when all three penalties stack', () => {
    const result = getConfidenceLevel({
      cvSkills: [],
      jobSkills: [],
      textScore: 0,
    });

    // 100 - 20 (jobSkills) - 20 (cvSkills) - 25 (textScore) = 35, which is < 40.
    // This is the only combination in this test suite that reaches 'low' —
    // any single missing/weak field alone only drops to 'medium' or stays 'high'.
    expect(result).toBe('low');
  });
});
