import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  getMonthlySummaryMock,
  requireAuthenticatedUserMock,
  withRequestLoggingMock,
} = vi.hoisted(() => ({
  getMonthlySummaryMock: vi.fn(),
  requireAuthenticatedUserMock: vi.fn(),
  withRequestLoggingMock: vi.fn(
    async (
      _request: Request,
      handler: (context: { logger: { error: ReturnType<typeof vi.fn> } }) => Promise<Response>,
    ) =>
      handler({
        logger: {
          error: vi.fn(),
        },
      }),
  ),
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

vi.mock('../../../../lib/dashboard/dashboard-service', () => ({
  getDashboardService: () => ({
    getMonthlySummary: getMonthlySummaryMock,
  }),
}));

import { GET } from './route';

function createUser(): User {
  return {
    app_metadata: { provider: 'phone', providers: ['phone'] },
    aud: 'authenticated',
    created_at: '2026-04-27T00:00:00.000Z',
    id: 'user-1',
    phone: '13812345678',
    updated_at: '2026-04-27T00:00:00.000Z',
    user_metadata: {},
  } as User;
}

describe('GET /api/dashboard/monthly-summary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuthenticatedUserMock.mockResolvedValue({
      accessToken: 'token',
      user: createUser(),
    });
  });

  it('returns the authenticated dashboard monthly summary', async () => {
    getMonthlySummaryMock.mockResolvedValue({
      aiCoverageRate: 0,
      aiCoveredCount: 0,
      categoryBreakdown: [],
      hasTransactions: false,
      month: '2026-04',
      pendingConfirmationCount: 0,
      spotlight: null,
      totalExpenseCents: 0,
      transactionCount: 0,
    });

    const response = await GET(
      new Request('https://example.com/api/dashboard/monthly-summary?month=2026-04') as never,
    );

    expect(getMonthlySummaryMock).toHaveBeenCalledWith({
      month: '2026-04',
      userId: 'user-1',
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: expect.objectContaining({
        month: '2026-04',
      }),
    });
  });

  it('rejects invalid month values', async () => {
    const response = await GET(
      new Request('https://example.com/api/dashboard/monthly-summary?month=2026-13') as never,
    );

    expect(getMonthlySummaryMock).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: 'DASHBOARD_INVALID_MONTH',
      },
    });
  });
});
