import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  listRecentTransactionsMock,
  requireAuthenticatedUserMock,
  withRequestLoggingMock,
} = vi.hoisted(() => ({
  listRecentTransactionsMock: vi.fn(),
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

vi.mock('../../../../lib/billing/transaction-service', () => ({
  getTransactionService: () => ({
    listRecentTransactions: listRecentTransactionsMock,
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

describe('GET /api/billing/transactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuthenticatedUserMock.mockResolvedValue({
      accessToken: 'token',
      user: createUser(),
    });
  });

  it('returns recent transactions for the authenticated user', async () => {
    listRecentTransactionsMock.mockResolvedValue({
      hasMore: false,
      limit: 10,
      transactions: [],
    });

    const response = await GET(
      new Request('https://example.com/api/billing/transactions?limit=10') as never,
    );

    expect(listRecentTransactionsMock).toHaveBeenCalledWith({
      limit: 10,
      userId: 'user-1',
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        hasMore: false,
        limit: 10,
        transactions: [],
      },
    });
  });

  it('rejects limits above the protected maximum', async () => {
    const response = await GET(
      new Request('https://example.com/api/billing/transactions?limit=51') as never,
    );

    expect(listRecentTransactionsMock).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: 'DASHBOARD_INVALID_LIMIT',
      },
    });
  });
});
