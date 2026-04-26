import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { withRequestLoggingMock, loggerMock } = vi.hoisted(() => ({
  loggerMock: {
    info: vi.fn(),
  },
  withRequestLoggingMock: vi.fn(
    async (
      _request: Request,
      handler: (ctx: { logger: { info: ReturnType<typeof vi.fn> } }) => Promise<Response>,
    ) => handler({ logger: loggerMock }),
  ),
}));

const { requireAuthenticatedUserMock, storeNotificationCaptureMock } = vi.hoisted(() => ({
  requireAuthenticatedUserMock: vi.fn(),
  storeNotificationCaptureMock: vi.fn(),
}));

vi.mock('../../../../lib/middleware/request-logger', () => ({
  withRequestLogging: withRequestLoggingMock,
}));

vi.mock('../../../../lib/middleware/require-authenticated-user', () => ({
  AuthenticatedUserError: class AuthenticatedUserError extends Error {
    constructor(
      public readonly code: string,
      public readonly status: number,
      message: string,
    ) {
      super(message);
    }
  },
  requireAuthenticatedUser: requireAuthenticatedUserMock,
}));

vi.mock('../../../../lib/db/repositories/notification-capture-repo', () => ({
  notificationCaptureRepository: {
    store: storeNotificationCaptureMock,
  },
}));

import { POST } from './route';

function createUser(): User {
  return {
    app_metadata: { provider: 'phone', providers: ['phone'] },
    aud: 'authenticated',
    created_at: '2026-04-24T00:00:00.000Z',
    id: 'user-1',
    phone: '13812345678',
    updated_at: '2026-04-24T00:00:00.000Z',
    user_metadata: {},
  } as User;
}

function createRequest(body: unknown): Request {
  return new Request('https://example.com/api/billing/capture', {
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: {
      authorization: 'Bearer access-token',
      'content-type': 'application/json',
    },
    method: 'POST',
  });
}

describe('POST /api/billing/capture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuthenticatedUserMock.mockResolvedValue({
      accessToken: 'access-token',
      user: createUser(),
    });
  });

  it('accepts a structured capture payload and returns normalized data', async () => {
    storeNotificationCaptureMock.mockResolvedValue({
      duplicate: false,
      normalized: {
        amountCents: 1680,
        merchantName: '瑞幸咖啡',
        platform: 'alipay',
        transactionTime: '2026-04-24T01:00:00.000Z',
      },
    });

    const response = await POST(
      createRequest({
        capture: {
          amountCents: 1680,
          merchantName: '  瑞幸咖啡 ',
          transactionTime: '2026-04-24T01:00:00.000Z',
          platform: 'alipay',
        },
        deviceId: 'android-xiaomi-1',
      }) as never,
    );

    expect(withRequestLoggingMock).toHaveBeenCalledOnce();
    expect(requireAuthenticatedUserMock).toHaveBeenCalledOnce();
    expect(storeNotificationCaptureMock).toHaveBeenCalledWith({
      capture: {
        amountCents: 1680,
        merchantName: '  瑞幸咖啡 ',
        platform: 'alipay',
        transactionTime: '2026-04-24T01:00:00.000Z',
      },
      capturedAt: undefined,
      deviceId: 'android-xiaomi-1',
      userId: 'user-1',
    });
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        duplicate: false,
        normalized: {
          amountCents: 1680,
          merchantName: '瑞幸咖啡',
          platform: 'alipay',
          transactionTime: '2026-04-24T01:00:00.000Z',
        },
        receivedAt: expect.any(String),
      },
    });
    expect(loggerMock.info).toHaveBeenCalledWith(
      {
        duplicate: false,
        platform: 'alipay',
        amountCents: 1680,
        userId: 'user-1',
      },
      'billing:capture:accepted',
    );
  });

  it('marks duplicate persisted captures without inserting a second transaction', async () => {
    storeNotificationCaptureMock.mockResolvedValue({
      duplicate: true,
      normalized: {
        amountCents: 1680,
        merchantName: '瑞幸咖啡',
        platform: 'alipay',
        transactionTime: '2026-04-24T01:04:00.000Z',
      },
    });

    const duplicateResponse = await POST(
      createRequest({
        capture: {
          amountCents: 1680,
          merchantName: '瑞幸咖啡',
          transactionTime: '2026-04-24T01:04:00.000Z',
          platform: 'alipay',
        },
        deviceId: 'android-xiaomi-1',
      }) as never,
    );

    expect(duplicateResponse.status).toBe(200);
    await expect(duplicateResponse.json()).resolves.toEqual({
      success: true,
      data: {
        duplicate: true,
        normalized: {
          amountCents: 1680,
          merchantName: '瑞幸咖啡',
          platform: 'alipay',
          transactionTime: '2026-04-24T01:04:00.000Z',
        },
        receivedAt: expect.any(String),
      },
    });
  });

  it('rejects unauthenticated capture uploads', async () => {
    requireAuthenticatedUserMock.mockRejectedValue(
      Object.assign(new Error('Missing bearer token'), {
        code: 'AUTH_UNAUTHORIZED',
        status: 401,
      }),
    );

    const response = await POST(
      createRequest({
        capture: {
          amountCents: 1680,
          merchantName: '瑞幸咖啡',
          transactionTime: '2026-04-24T01:00:00.000Z',
          platform: 'alipay',
        },
      }) as never,
    );

    expect(storeNotificationCaptureMock).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: 'AUTH_UNAUTHORIZED',
        message: 'Missing bearer token',
      },
    });
  });

  it('returns a structured 400 for invalid JSON', async () => {
    const response = await POST(createRequest('{') as never);

    expect(storeNotificationCaptureMock).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: 'AUTH_INVALID_INPUT',
      },
    });
  });
});
