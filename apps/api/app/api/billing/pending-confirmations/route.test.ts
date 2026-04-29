import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  listPendingConfirmationsMock,
  requireAuthenticatedUserMock,
  withRequestLoggingMock,
} = vi.hoisted(() => ({
  listPendingConfirmationsMock: vi.fn(),
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

vi.mock('../../../../lib/billing/confirmation-service', () => ({
  getConfirmationService: () => ({
    listPendingConfirmations: listPendingConfirmationsMock,
  }),
}));

import { GET } from './route';

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

describe('GET /api/billing/pending-confirmations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuthenticatedUserMock.mockResolvedValue({
      accessToken: 'token',
      user: createUser(),
    });
  });

  it('returns pending confirmations for the authenticated user', async () => {
    listPendingConfirmationsMock.mockResolvedValue({
      categories: [],
      transactions: [],
    });

    const response = await GET(
      new Request('https://example.com/api/billing/pending-confirmations') as never,
    );

    expect(listPendingConfirmationsMock).toHaveBeenCalledWith('user-1');
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        categories: [],
        transactions: [],
      },
    });
  });
});
