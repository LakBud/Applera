import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from '../../mocks/server';

// Start MSW before all integration tests, reset handlers between tests
// (so one test's mocked response can't leak into the next), and close
// the server once the whole file is done.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
