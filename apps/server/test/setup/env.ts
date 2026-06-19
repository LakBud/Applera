import { vi } from 'vitest';

process.env.NODE_ENV = 'test';

vi.stubGlobal(
  'fetch',
  vi.fn(() => {
    throw new Error('Unmocked network call via fetch() in a test. Mock the client/module instead.');
  }),
);
