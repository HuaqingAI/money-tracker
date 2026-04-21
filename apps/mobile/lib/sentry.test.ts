import { beforeEach, describe, expect, it, vi } from 'vitest';

const { initMock } = vi.hoisted(() => ({
  initMock: vi.fn(),
}));

vi.mock('@sentry/react-native', () => ({
  init: initMock,
  wrap: vi.fn((component) => component),
}));

import { initSentry } from './sentry';

describe('initSentry', () => {
  beforeEach(() => {
    initMock.mockReset();
    vi.unstubAllEnvs();
  });

  it('skips initialization when DSN is missing', () => {
    vi.stubEnv('EXPO_PUBLIC_SENTRY_DSN', '');

    initSentry();

    expect(initMock).not.toHaveBeenCalled();
  });

  it('initializes sentry with safe defaults', () => {
    vi.stubEnv('EXPO_PUBLIC_SENTRY_DSN', 'https://dsn.example');
    vi.stubEnv('EXPO_PUBLIC_SENTRY_ENVIRONMENT', 'staging');
    vi.stubEnv('EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE', '0.25');

    initSentry();

    expect(initMock).toHaveBeenCalledWith({
      dsn: 'https://dsn.example',
      environment: 'staging',
      tracesSampleRate: 0.25,
      enableAutoSessionTracking: true,
      sendDefaultPii: false,
      debug: false,
    });
  });

  it('falls back to development defaults', () => {
    vi.stubEnv('EXPO_PUBLIC_SENTRY_DSN', 'https://dsn.example');

    initSentry();

    expect(initMock).toHaveBeenCalledWith(
      expect.objectContaining({
        environment: 'development',
        tracesSampleRate: 0.1,
      }),
    );
  });
});
