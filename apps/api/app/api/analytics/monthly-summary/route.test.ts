import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAuthenticatedUserMock, withRequestLoggingMock } = vi.hoisted(() => ({
  requireAuthenticatedUserMock: vi.fn(),
  withRequestLoggingMock: vi.fn(
    async (_request: Request, handler: () => Promise<Response>) => handler(),
  ),
}));

const { getMonthlySummaryMock } = vi.hoisted(() => ({
  getMonthlySummaryMock: vi.fn(),
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
  getMonthlySummary: getMonthlySummaryMock,
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

describe('GET /api/analytics/monthly-summary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuthenticatedUserMock.mockResolvedValue({
      accessToken: 'access-token',
      user: createUser(),
    });
    getMonthlySummaryMock.mockResolvedValue({
      categories: [],
      comparisons: {
        previousMonth: null,
        yearOverYear: null,
      },
      generatedAt: '2026-04-27T00:00:00.000Z',
      month: '2026-04',
      monthEnd: '2026-05-01T00:00:00.000Z',
      monthStart: '2026-04-01T00:00:00.000Z',
      source: 'live',
      totalExpenseCents: 0,
      transactionCount: 0,
    });
  });

  it('returns monthly summary for the authenticated user', async () => {
    const response = await GET(
      new Request('https://example.com/api/analytics/monthly-summary?month=2026-04') as never,
    );

    expect(getMonthlySummaryMock).toHaveBeenCalledWith('user-1', '2026-04', {
      includePending: false,
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: {
        month: '2026-04',
      },
    });
  });

  it('passes includePending query to the monthly summary service', async () => {
    const response = await GET(
      new Request('https://example.com/api/analytics/monthly-summary?month=2026-04&includePending=true') as never,
    );

    expect(getMonthlySummaryMock).toHaveBeenCalledWith('user-1', '2026-04', {
      includePending: true,
    });
    expect(response.status).toBe(200);
  });

  it('rejects invalid month query values', async () => {
    const response = await GET(
      new Request('https://example.com/api/analytics/monthly-summary?month=2026-13') as never,
    );

    expect(getMonthlySummaryMock).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: 'INVALID_MONTHLY_SUMMARY_QUERY',
        message: 'month must use YYYY-MM format',
      },
    });
  });

  it('rejects unauthenticated users', async () => {
    requireAuthenticatedUserMock.mockRejectedValue(
      Object.assign(new Error('Missing bearer token'), {
        code: 'AUTH_UNAUTHORIZED',
        status: 401,
      }),
    );

    const response = await GET(
      new Request('https://example.com/api/analytics/monthly-summary?month=2026-04') as never,
    );

    expect(getMonthlySummaryMock).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: 'AUTH_UNAUTHORIZED',
        message: 'Missing bearer token',
      },
    });
  });
});
