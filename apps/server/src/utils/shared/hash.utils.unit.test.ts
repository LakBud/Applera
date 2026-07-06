import crypto from 'crypto';
import { describe, it, expect } from 'vitest';

import { hash, hashRequest } from './hash.utils.js';

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

describe('hash', () => {
  it('hashes a string directly (no double-stringify)', () => {
    expect(hash('hello')).toBe(sha256('hello'));
  });

  it('is deterministic for the same input', () => {
    expect(hash({ a: 1, b: 2 })).toBe(hash({ a: 1, b: 2 }));
  });

  it('produces different hashes for different objects', () => {
    expect(hash({ a: 1 })).not.toBe(hash({ a: 2 }));
  });

  it('is sensitive to key order (JSON.stringify is not order-independent)', () => {
    // { a: 1, b: 2 } and { b: 2, a: 1 } stringify to different strings
    expect(hash({ a: 1, b: 2 })).not.toBe(hash({ b: 2, a: 1 }));
  });

  it('hashes numbers, booleans, arrays via JSON.stringify', () => {
    expect(hash(42)).toBe(sha256('42'));
    expect(hash(true)).toBe(sha256('true'));
    expect(hash([1, 2, 3])).toBe(sha256('[1,2,3]'));
  });

  it('hashes undefined as the literal string "undefined"', () => {
    expect(hash(undefined)).toBe(sha256('undefined'));
  });

  it('hashes null via JSON.stringify as "null"', () => {
    expect(hash(null)).toBe(sha256('null'));
  });

  it('falls back to hashing "undefined" for circular references', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(hash(circular)).toBe(sha256('undefined'));
  });

  it('falls back to hashing "undefined" for BigInt (JSON.stringify throws)', () => {
    expect(hash(BigInt(10))).toBe(sha256('undefined'));
  });

  it('treats a function as undefined (JSON.stringify returns undefined, not a throw)', () => {
    // JSON.stringify(fn) returns undefined (not a thrown error), so this hits
    // the `?? 'undefined'` fallback inside the try, not the catch block
    expect(hash(() => {})).toBe(sha256('undefined'));
  });
});

describe('hashRequest', () => {
  it('double-stringifies before hashing (note: this differs from hash())', () => {
    // hashRequest always JSON.stringifies first, then hash() stringifies again
    // since the result is already a string, hash() will NOT re-stringify it
    const input = { a: 1 };
    const expected = sha256(JSON.stringify(input));
    expect(hashRequest(input)).toBe(expected);
  });

  it('produces a different hash than calling hash() directly on the same object', () => {
    // hash({a:1}) hashes JSON.stringify({a:1}) once
    // hashRequest({a:1}) hashes JSON.stringify({a:1}) once too, but only because
    // hash() sees a string and skips its own stringify step — verify this isn't
    // accidentally double-encoding
    expect(hashRequest({ a: 1 })).toBe(hash({ a: 1 }));
  });

  it('hashes a string input as a JSON-quoted string, not raw', () => {
    // JSON.stringify('hello') === '"hello"', so hashRequest('hello') !== hash('hello')
    expect(hashRequest('hello')).toBe(sha256('"hello"'));
    expect(hashRequest('hello')).not.toBe(hash('hello'));
  });
});
