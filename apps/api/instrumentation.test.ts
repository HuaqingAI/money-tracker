import { beforeEach, describe, expect, it, vi } from 'vitest';

const { captureRequestErrorMock, serverConfigModule, edgeConfigModule } = vi.hoisted(() => ({
  captureRequestErrorMock: vi.fn(),
  serverConfigModule: { loaded: false },
  edgeConfigModule: { loaded: false },
}));

vi.mock('@sentry/nextjs', () => ({
  captureRequestError: captureRequestErrorMock,
}));

vi.mock('./sentry.server.config', () => {
  serverConfigModule.loaded = true;
  return {};
});

vi.mock('./sentry.edge.config', () => {
  edgeConfigModule.loaded = true;
  return {};
});

import { onRequestError, register } from './instrumentation';

describe('instrumentation', () => {
  beforeEach(() => {
    serverConfigModule.loaded = false;
    edgeConfigModule.loaded = false;
    vi.unstubAllEnvs();
  });

  it('loads nodejs sentry config for node runtime', async () => {
    vi.stubEnv('NEXT_RUNTIME', 'nodejs');

    await register();

    expect(serverConfigModule.loaded).toBe(true);
    expect(edgeConfigModule.loaded).toBe(false);
  });

  it('loads edge sentry config for edge runtime', async () => {
    vi.stubEnv('NEXT_RUNTIME', 'edge');

    await register();

    expect(serverConfigModule.loaded).toBe(false);
    expect(edgeConfigModule.loaded).toBe(true);
  });

  it('re-exports sentry request error handler', () => {
    expect(onRequestError).toBe(captureRequestErrorMock);
  });
});
