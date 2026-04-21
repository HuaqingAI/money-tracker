import { beforeEach, describe, expect, it, vi } from 'vitest';

const { withRequestLoggingMock } = vi.hoisted(() => ({
  withRequestLoggingMock: vi.fn(
    async (_request: Request, handler: () => Promise<Response>) => handler(),
  ),
}));

vi.mock('../../../lib/middleware/request-logger', () => ({
  withRequestLogging: withRequestLoggingMock,
}));

import { GET } from './route';

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('returns 200 when database and ai checks pass', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://demo.supabase.co');
    vi.stubEnv('SUPABASE_ANON_KEY', 'anon-key');
    vi.stubEnv('AI_PRIMARY_API_KEY', 'ai-key');

    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    const response = await GET(
      new Request('https://example.com/api/health', { method: 'GET' }) as never,
    );

    expect(withRequestLoggingMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://demo.supabase.co/rest/v1/',
      expect.objectContaining({
        method: 'HEAD',
        headers: {
          apikey: 'anon-key',
          Authorization: 'Bearer anon-key',
        },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      timestamp: expect.any(String),
      services: {
        database: 'ok',
        ai: 'ok',
      },
    });
  });

  it('returns 503 when environment-based checks fail', async () => {
    vi.stubEnv('SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_ANON_KEY', '');
    vi.stubEnv('AI_PRIMARY_API_KEY', '');

    const fetchMock = vi.mocked(globalThis.fetch);

    const response = await GET(
      new Request('https://example.com/api/health', { method: 'GET' }) as never,
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      success: false,
      timestamp: expect.any(String),
      services: {
        database: 'error',
        ai: 'error',
      },
    });
  });

  it('returns 503 when database connectivity throws', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://demo.supabase.co');
    vi.stubEnv('SUPABASE_ANON_KEY', 'anon-key');
    vi.stubEnv('AI_PRIMARY_API_KEY', 'ai-key');

    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockRejectedValue(new Error('network error'));

    const response = await GET(
      new Request('https://example.com/api/health', { method: 'GET' }) as never,
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      success: false,
      timestamp: expect.any(String),
      services: {
        database: 'error',
        ai: 'ok',
      },
    });
  });
});
