import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  confirmBulkMock,
  requireAuthenticatedUserMock,
  withRequestLoggingMock,
} = vi.hoisted(() => ({
  confirmBulkMock: vi.fn(),
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

vi.mock('../../../../../lib/middleware/request-logger', () => ({
  withRequestLogging: withRequestLoggingMock,
}));

vi.mock('../../../../../lib/middleware/require-authenticated-user', () => ({
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

vi.mock('../../../../../lib/billing/confirmation-service', () => ({
  getConfirmationService: () => ({
    confirmBulk: confirmBulkMock,
  }),
}));

import { POST } from './route';

function createUser(): User {
  return {
    app_metadata: { provider: 'phone', providers: ['phone'] },
    aud: 'authenticated',
    created_at: '2026-04-28T00:00:00.000Z',
    id: 'user-1',
    phone: '13812345678',
    updated_at: '2026-04-28T00:00:00.000Z',
    user_metadata: {},
  } as User;
}

describe('POST /api/billing/transactions/confirm-bulk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuthenticatedUserMock.mockResolvedValue({
      accessToken: 'token',
      user: createUser(),
    });
  });

  it('bulk confirms pending transactions for the authenticated user', async () => {
    confirmBulkMock.mockResolvedValue({ confirmedCount: 1 });

    const response = await POST(
      new Request('https://example.com/api/billing/transactions/confirm-bulk', {
        body: JSON.stringify({
          transactionIds: ['11111111-1111-4111-8111-111111111111'],
        }),
        method: 'POST',
      }) as never,
    );

    expect(confirmBulkMock).toHaveBeenCalledWith({
      transactionIds: ['11111111-1111-4111-8111-111111111111'],
      userId: 'user-1',
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: { confirmedCount: 1 },
    });
  });

  it('rejects empty transaction lists', async () => {
    const response = await POST(
      new Request('https://example.com/api/billing/transactions/confirm-bulk', {
        body: JSON.stringify({
          transactionIds: [],
        }),
        method: 'POST',
      }) as never,
    );

    expect(confirmBulkMock).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
  });
});
