import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAuthenticatedUserMock, withRequestLoggingMock } = vi.hoisted(() => ({
  requireAuthenticatedUserMock: vi.fn(),
  withRequestLoggingMock: vi.fn(
    async (_request: Request, handler: () => Promise<Response>) => handler(),
  ),
}));

const { deleteUserAccountMock } = vi.hoisted(() => ({
  deleteUserAccountMock: vi.fn(),
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

vi.mock('../../../../lib/services/user-service', () => ({
  deleteUserAccount: deleteUserAccountMock,
}));

import { DELETE } from './route';

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

describe('DELETE /api/user/delete-account', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes the authenticated user account', async () => {
    requireAuthenticatedUserMock.mockResolvedValue({
      accessToken: 'token',
      user: createUser(),
    });
    deleteUserAccountMock.mockResolvedValue(undefined);

    const response = await DELETE(
      new Request('https://example.com/api/user/delete-account', {
        method: 'DELETE',
      }) as never,
    );

    expect(deleteUserAccountMock).toHaveBeenCalledWith(createUser());
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        deleted: true,
      },
    });
  });
});
