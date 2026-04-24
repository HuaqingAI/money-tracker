import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAuthenticatedUserMock, withRequestLoggingMock } = vi.hoisted(() => ({
  requireAuthenticatedUserMock: vi.fn(),
  withRequestLoggingMock: vi.fn(
    async (_request: Request, handler: () => Promise<Response>) => handler(),
  ),
}));

const { getUserProfileMock, updateUserProfileMock } = vi.hoisted(() => ({
  getUserProfileMock: vi.fn(),
  updateUserProfileMock: vi.fn(),
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
  getUserProfile: getUserProfileMock,
  updateUserProfile: updateUserProfileMock,
}));

import { GET, PUT } from './route';

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

describe('GET /api/user/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the authenticated user profile', async () => {
    requireAuthenticatedUserMock.mockResolvedValue({
      accessToken: 'token',
      user: createUser(),
    });
    getUserProfileMock.mockResolvedValue({
      avatarUrl: null,
      consentAt: null,
      createdAt: null,
      loginMethod: 'phone',
      maskedPhoneNumber: '138****5678',
      nickname: 'Sue',
      updatedAt: null,
      userId: 'user-1',
    });

    const response = await GET(
      new Request('https://example.com/api/user/profile') as never,
    );

    expect(withRequestLoggingMock).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: expect.objectContaining({
        nickname: 'Sue',
      }),
    });
  });
});

describe('PUT /api/user/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid payloads', async () => {
    requireAuthenticatedUserMock.mockResolvedValue({
      accessToken: 'token',
      user: createUser(),
    });

    const response = await PUT(
      new Request('https://example.com/api/user/profile', {
        body: JSON.stringify({
          avatarUrl: null,
          nickname: '',
        }),
        headers: {
          'content-type': 'application/json',
        },
        method: 'PUT',
      }) as never,
    );

    expect(updateUserProfileMock).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: 'INVALID_PROFILE_INPUT',
        message: '昵称不能为空',
      },
    });
  });

  it('updates the authenticated user profile', async () => {
    requireAuthenticatedUserMock.mockResolvedValue({
      accessToken: 'token',
      user: createUser(),
    });
    updateUserProfileMock.mockResolvedValue({
      avatarUrl: 'https://example.com/avatar.png',
      consentAt: null,
      createdAt: null,
      loginMethod: 'phone',
      maskedPhoneNumber: '138****5678',
      nickname: 'New Nickname',
      updatedAt: null,
      userId: 'user-1',
    });

    const response = await PUT(
      new Request('https://example.com/api/user/profile', {
        body: JSON.stringify({
          avatarUrl: 'https://example.com/avatar.png',
          nickname: 'New Nickname',
        }),
        headers: {
          'content-type': 'application/json',
        },
        method: 'PUT',
      }) as never,
    );

    expect(updateUserProfileMock).toHaveBeenCalledWith(createUser(), {
      avatarUrl: 'https://example.com/avatar.png',
      nickname: 'New Nickname',
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: expect.objectContaining({
        nickname: 'New Nickname',
      }),
    });
  });
});
