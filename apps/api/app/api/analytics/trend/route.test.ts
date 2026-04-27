import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAuthenticatedUserMock, withRequestLoggingMock } = vi.hoisted(() => ({
  requireAuthenticatedUserMock: vi.fn(),
  withRequestLoggingMock: vi.fn(
    async (_request: Request, handler: () => Promise<Response>) => handler(),
  ),
}));

const { getMonthlyTrendMock } = vi.hoisted(() => ({
  getMonthlyTrendMock: vi.fn(),
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

vi.mock('../../../../lib/analytics/monthly-summary-service', () => ({
  getMonthlyTrend: getMonthlyTrendMock,
}));

import { GET } from './route';

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

describe('GET /api/analytics/trend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuthenticatedUserMock.mockResolvedValue({
      accessToken: 'access-token',
      user: createUser(),
    });
    getMonthlyTrendMock.mockResolvedValue({
      endMonth: '2026-04',
      months: 12,
      points: [],
      startMonth: '2025-05',
    });
  });

  it('returns monthly trend points with default 12 months', async () => {
    const response = await GET(
      new Request('https://example.com/api/analytics/trend') as never,
    );

    expect(getMonthlyTrendMock).toHaveBeenCalledWith('user-1', 12, undefined);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: {
        months: 12,
      },
    });
  });

  it('supports explicit months and endMonth values', async () => {
    const response = await GET(
      new Request('https://example.com/api/analytics/trend?months=6&endMonth=2026-03') as never,
    );

    expect(getMonthlyTrendMock).toHaveBeenCalledWith('user-1', 6, '2026-03');
    expect(response.status).toBe(200);
  });

  it('rejects invalid month counts', async () => {
    const response = await GET(
      new Request('https://example.com/api/analytics/trend?months=25') as never,
    );

    expect(getMonthlyTrendMock).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: 'INVALID_MONTHLY_TREND_QUERY',
        message: 'months must be at most 24',
      },
    });
  });
});
