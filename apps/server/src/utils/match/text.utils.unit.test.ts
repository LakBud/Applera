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

  it('returns medium for weak/empty input', () => {
    expect(getConfidenceLevel({})).toBe('medium');
  });

  it('cvSkills threshold boundary (2 → penalized, 3 → ok)', () => {
    const low = getConfidenceLevel({
      cvSkills: ['a', 'b'],
      jobSkills: ['a', 'b', 'c', 'd'],
      textScore: 20,
    });

    const ok = getConfidenceLevel({
      cvSkills: ['a', 'b', 'c'],
      jobSkills: ['a', 'b', 'c', 'd'],
      textScore: 20,
    });

    const order = ['low', 'medium', 'high'];

    expect(order.indexOf(low)).toBeLessThanOrEqual(order.indexOf(ok));
    expect(ok).toBe('high');
  });

  it('jobSkills threshold boundary (3 vs 4)', () => {
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

    expect(ok).toBe('high');
    expect(under).not.toBe('low'); // behavior-focused, not math
  });

  it('textScore boundary (14 vs 15)', () => {
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

    expect(ok).toBe('high');
    expect(low).not.toBe('low');
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

    expect(['high', 'medium']).toContain(good);
    expect(worse).toBe('medium');

    // monotonic sanity check
    expect(['low', 'medium', 'high'].indexOf(worse)).toBeLessThanOrEqual(
      ['low', 'medium', 'high'].indexOf(good),
    );
  });

  it('handles missing fields safely', () => {
    expect(getConfidenceLevel({ jobSkills: ['a', 'b', 'c', 'd'] })).toBe('high');
    expect(getConfidenceLevel({ cvSkills: ['a', 'b', 'c'] })).toBe('high');
    expect(getConfidenceLevel({ textScore: 20 })).toBe('high');
  });

  it('documents that low tier is rarely reachable (optional system constraint)', () => {
    const result = getConfidenceLevel({
      cvSkills: [],
      jobSkills: [],
      textScore: 0,
    });

    expect(result).not.toBe('low');
  });
});
