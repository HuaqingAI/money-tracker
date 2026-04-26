import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { loggerMock, createRequestLoggerMock } = vi.hoisted(() => {
  const loggerMock = {
    info: vi.fn(),
    error: vi.fn(),
  };

  return {
    loggerMock,
    createRequestLoggerMock: vi.fn(() => loggerMock),
  };
});

vi.mock('../logger', () => ({
  createRequestLogger: createRequestLoggerMock,
  logger: loggerMock,
}));

import { getRequestId, withRequestLogging } from './request-logger';

describe('request-logger', () => {
  beforeEach(() => {
    loggerMock.info.mockReset();
    loggerMock.error.mockReset();
    createRequestLoggerMock.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reuses incoming request id header when present', () => {
    const request = new Request('https://example.com/api/health', {
      headers: {
        'x-request-id': 'upstream-id',
      },
    });

    expect(getRequestId(request)).toBe('upstream-id');
  });

  it('generates a request id when header is missing', () => {
    const randomUUIDSpy = vi
      .spyOn(globalThis.crypto, 'randomUUID')
      .mockReturnValue('00000000-0000-0000-0000-000000000001');

    const request = new Request('https://example.com/api/health');

    expect(getRequestId(request)).toBe('00000000-0000-0000-0000-000000000001');
    expect(randomUUIDSpy).toHaveBeenCalledOnce();
  });

  it('logs request lifecycle and injects response header', async () => {
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(
      '00000000-0000-0000-0000-000000000002',
    );

    const request = new Request('https://example.com/api/health', {
      method: 'GET',
    });

    const response = await withRequestLogging(request, async ({ requestId }) => {
      expect(requestId).toBe('00000000-0000-0000-0000-000000000002');
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
    });

    expect(createRequestLoggerMock).toHaveBeenCalledWith(
      '00000000-0000-0000-0000-000000000002',
    );
    expect(loggerMock.info).toHaveBeenNthCalledWith(
      1,
      { method: 'GET', url: 'https://example.com/api/health' },
      'request:start',
    );
    expect(loggerMock.info).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        method: 'GET',
        url: 'https://example.com/api/health',
        status: 200,
        durationMs: expect.any(Number),
      }),
      'request:end',
    );
    expect(response.headers.get('X-Request-Id')).toBe(
      '00000000-0000-0000-0000-000000000002',
    );
    expect(await response.json()).toEqual({ ok: true });
  });

  it('logs and rethrows handler errors', async () => {
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(
      '00000000-0000-0000-0000-000000000003',
    );

    const request = new Request('https://example.com/api/health', {
      method: 'GET',
    });
    const error = new Error('boom');

    await expect(
      withRequestLogging(request, async () => {
        throw error;
      }),
    ).rejects.toThrow('boom');

    expect(loggerMock.error).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://example.com/api/health',
        durationMs: expect.any(Number),
        err: error,
      }),
      'request:error',
    );
  });
});
