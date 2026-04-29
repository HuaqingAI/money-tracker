import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  confirmTransactionMock,
  requireAuthenticatedUserMock,
  withRequestLoggingMock,
} = vi.hoisted(() => ({
  confirmTransactionMock: vi.fn(),
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

vi.mock('../../../../../../lib/middleware/request-logger', () => ({
  withRequestLogging: withRequestLoggingMock,
}));

vi.mock('../../../../../../lib/middleware/require-authenticated-user', () => ({
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

vi.mock('../../../../../../lib/billing/confirmation-service', () => ({
  getConfirmationService: () => ({
    confirmTransaction: confirmTransactionMock,
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

describe('POST /api/billing/transactions/:id/confirm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuthenticatedUserMock.mockResolvedValue({
      accessToken: 'token',
      user: createUser(),
    });
  });

  it('confirms a pending transaction for the authenticated user', async () => {
    confirmTransactionMock.mockResolvedValue({
      status: 'confirmed',
      transactionId: 'tx-1',
    });

    const response = await POST(
      new Request('https://example.com/api/billing/transactions/tx-1/confirm', {
        method: 'POST',
      }) as never,
      { params: Promise.resolve({ id: 'tx-1' }) },
    );

    expect(confirmTransactionMock).toHaveBeenCalledWith({
      transactionId: 'tx-1',
      userId: 'user-1',
    });
    expect(response.status).toBe(200);
  });

  it('confirms with a corrected category', async () => {
    confirmTransactionMock.mockResolvedValue({
      status: 'confirmed',
      transactionId: 'tx-1',
    });

    const response = await POST(
      new Request('https://example.com/api/billing/transactions/tx-1/confirm', {
        body: JSON.stringify({
          categoryId: '33333333-3333-4333-8333-333333333333',
        }),
        method: 'POST',
      }) as never,
      { params: Promise.resolve({ id: 'tx-1' }) },
    );

    expect(confirmTransactionMock).toHaveBeenCalledWith({
      categoryId: '33333333-3333-4333-8333-333333333333',
      transactionId: 'tx-1',
      userId: 'user-1',
    });
    expect(response.status).toBe(200);
  });
});
