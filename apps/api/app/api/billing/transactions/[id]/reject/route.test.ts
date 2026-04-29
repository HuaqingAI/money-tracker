import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  rejectTransactionMock,
  requireAuthenticatedUserMock,
  withRequestLoggingMock,
} = vi.hoisted(() => ({
  rejectTransactionMock: vi.fn(),
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
    rejectTransaction: rejectTransactionMock,
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

describe('POST /api/billing/transactions/:id/reject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuthenticatedUserMock.mockResolvedValue({
      accessToken: 'token',
      user: createUser(),
    });
  });

  it('rejects a pending transaction with a corrected category', async () => {
    rejectTransactionMock.mockResolvedValue({
      categoryId: '00000000-0000-4000-8000-000000000001',
      status: 'rejected',
      transactionId: 'tx-1',
    });

    const response = await POST(
      new Request('https://example.com/api/billing/transactions/tx-1/reject', {
        body: JSON.stringify({
          categoryId: '00000000-0000-4000-8000-000000000001',
        }),
        method: 'POST',
      }) as never,
      { params: Promise.resolve({ id: 'tx-1' }) },
    );

    expect(rejectTransactionMock).toHaveBeenCalledWith({
      categoryId: '00000000-0000-4000-8000-000000000001',
      transactionId: 'tx-1',
      userId: 'user-1',
    });
    expect(response.status).toBe(200);
  });

  it('supports pure rejection without a corrected category', async () => {
    rejectTransactionMock.mockResolvedValue({
      categoryId: null,
      status: 'rejected',
      transactionId: 'tx-1',
    });

    const response = await POST(
      new Request('https://example.com/api/billing/transactions/tx-1/reject', {
        body: '{}',
        method: 'POST',
      }) as never,
      { params: Promise.resolve({ id: 'tx-1' }) },
    );

    expect(rejectTransactionMock).toHaveBeenCalledWith({
      transactionId: 'tx-1',
      userId: 'user-1',
    });
    expect(response.status).toBe(200);
  });

  it('rejects malformed request bodies', async () => {
    const response = await POST(
      new Request('https://example.com/api/billing/transactions/tx-1/reject', {
        body: '{',
        method: 'POST',
      }) as never,
      { params: Promise.resolve({ id: 'tx-1' }) },
    );

    expect(rejectTransactionMock).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
  });
});
