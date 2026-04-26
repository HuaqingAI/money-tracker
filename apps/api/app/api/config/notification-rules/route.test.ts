import { beforeEach, describe, expect, it, vi } from 'vitest';

const { withRequestLoggingMock } = vi.hoisted(() => ({
  withRequestLoggingMock: vi.fn(
    async (_request: Request, handler: () => Promise<Response>) => handler(),
  ),
}));

vi.mock('@/lib/middleware/request-logger', () => ({
  withRequestLogging: withRequestLoggingMock,
}));

import { GET } from './route';

describe('GET /api/config/notification-rules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('returns default notification rules', async () => {
    const response = await GET(
      new Request(
        'https://example.com/api/config/notification-rules',
        { method: 'GET' },
      ) as never,
    );

    expect(withRequestLoggingMock).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: expect.objectContaining({
        version: expect.any(String),
        updatedAt: expect.any(String),
        rules: expect.arrayContaining([
          expect.objectContaining({
            platform: 'alipay',
          }),
        ]),
      }),
    });
  });

  it('falls back to default rules when env json is invalid', async () => {
    vi.stubEnv('NOTIFICATION_RULES_JSON', '{oops');

    const response = await GET(
      new Request(
        'https://example.com/api/config/notification-rules',
        { method: 'GET' },
      ) as never,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: expect.objectContaining({
        rules: expect.arrayContaining([
          expect.objectContaining({
            id: 'alipay-payment-notice',
          }),
        ]),
      }),
    });
  });
});
