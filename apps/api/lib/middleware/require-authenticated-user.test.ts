import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthIdentityRecord } from '../auth/types';

const authRepositoryMock = vi.hoisted(() => ({
  getUserById: vi.fn<(...args: never[]) => Promise<AuthIdentityRecord | null>>(),
}));

const getUserMock = vi.hoisted(() => vi.fn<(...args: never[]) => Promise<unknown>>());

vi.mock('../auth/repository', () => ({
  getAuthRepository: () => authRepositoryMock,
}));

vi.mock('@/db/supabase-admin', () => ({
  getSupabaseAdmin: () => ({
    auth: {
      getUser: getUserMock,
    },
  }),
}));

import { createAccessToken, createSignedToken } from '../auth/token';
import {
  AuthenticatedUserError,
  getAuthenticatedUser,
  requireAuthenticatedUser,
} from './require-authenticated-user';

const secret = 'test-jwt-secret';

function createAuthRecord(overrides: Partial<AuthIdentityRecord> = {}): AuthIdentityRecord {
  return {
    authMethod: 'otp',
    avatarUrl: 'file:///avatar.jpg',
    birthday: '1996-03-15',
    consentAt: '2026-04-24T00:00:00.000Z',
    createdAt: '2026-04-24T00:00:00.000Z',
    displayName: 'Local User',
    gender: 'female',
    id: 'user-1',
    lastSignInAt: '2026-04-24T00:00:00.000Z',
    needsOnboarding: false,
    phone: '13812345678',
    updatedAt: '2026-04-24T00:10:00.000Z',
    ...overrides,
  };
}

function createRequest(token?: string): Request {
  const headers = token
    ? {
        authorization: `Bearer ${token}`,
      }
    : undefined;

  return new Request('https://example.com/api/user/profile', { headers });
}

describe('authenticated user helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('JWT_SECRET', secret);
  });

  it('rejects requests without a bearer token', async () => {
    await expect(getAuthenticatedUser(createRequest())).rejects.toMatchObject({
      code: 'AUTH_UNAUTHORIZED',
      status: 401,
    });
    expect(authRepositoryMock.getUserById).not.toHaveBeenCalled();
    expect(getUserMock).not.toHaveBeenCalled();
  });

  it('accepts app-issued access tokens and maps in-memory auth users', async () => {
    authRepositoryMock.getUserById.mockResolvedValue(createAuthRecord());
    const { token } = createAccessToken(
      {
        authMethod: 'otp',
        needsOnboarding: false,
        phone: '13812345678',
        sub: 'user-1',
        type: 'access',
      },
      secret,
    );

    const result = await getAuthenticatedUser(createRequest(token));

    expect(authRepositoryMock.getUserById).toHaveBeenCalledWith('user-1');
    expect(getUserMock).not.toHaveBeenCalled();
    expect(result.user).toMatchObject({
      app_metadata: {
        app_auth: true,
        provider: 'phone',
        providers: ['phone'],
      },
      id: 'user-1',
      phone: '13812345678',
      user_metadata: {
        avatar_url: 'file:///avatar.jpg',
        birthday: '1996-03-15',
        gender: 'female',
        nickname: 'Local User',
      },
    });
  });

  it('accepts verified app-issued access tokens even when the in-memory user is unavailable', async () => {
    authRepositoryMock.getUserById.mockResolvedValue(null);
    const { token } = createAccessToken(
      {
        authMethod: 'otp',
        needsOnboarding: false,
        phone: '13812345678',
        sub: 'user-1',
        type: 'access',
      },
      secret,
    );

    const result = await requireAuthenticatedUser(createRequest(token));

    expect(authRepositoryMock.getUserById).toHaveBeenCalledWith('user-1');
    expect(getUserMock).not.toHaveBeenCalled();
    expect(result.user).toMatchObject({
      app_metadata: {
        app_auth: true,
        provider: 'phone',
        providers: ['phone'],
      },
      id: 'user-1',
      phone: '13812345678',
      user_metadata: {
        avatar_url: null,
        birthday: null,
        gender: null,
        nickname: null,
      },
    });
  });

  it('falls back to Supabase auth for non-app tokens', async () => {
    const supabaseUser = {
      app_metadata: { provider: 'phone', providers: ['phone'] },
      aud: 'authenticated',
      created_at: '2026-04-24T00:00:00.000Z',
      id: 'supabase-user-1',
      phone: '13812345678',
      updated_at: '2026-04-24T00:00:00.000Z',
      user_metadata: {},
    } as User;
    getUserMock.mockResolvedValue({
      data: { user: supabaseUser },
      error: null,
    });

    const result = await requireAuthenticatedUser(createRequest('supabase-token'));

    expect(authRepositoryMock.getUserById).not.toHaveBeenCalled();
    expect(getUserMock).toHaveBeenCalledWith('supabase-token');
    expect(result.user).toBe(supabaseUser);
  });

  it('rejects tampered app-issued access tokens', async () => {
    const { token } = createAccessToken(
      {
        authMethod: 'otp',
        needsOnboarding: false,
        phone: '13812345678',
        sub: 'user-1',
        type: 'access',
      },
      secret,
    );
    const parts = token.split('.');
    const tamperedToken = `${parts[0]}.${parts[1]}.tampered-signature`;
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: { message: 'invalid jwt' },
    });

    await expect(requireAuthenticatedUser(createRequest(tamperedToken))).rejects.toBeInstanceOf(
      AuthenticatedUserError,
    );
    expect(authRepositoryMock.getUserById).not.toHaveBeenCalled();
    expect(getUserMock).toHaveBeenCalledWith(tamperedToken);
  });

  it('rejects expired app-issued access tokens', async () => {
    const { token } = createSignedToken(
      {
        authMethod: 'otp',
        needsOnboarding: false,
        phone: '13812345678',
        sub: 'user-1',
        type: 'access',
      },
      secret,
      -60,
    );
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: { message: 'expired jwt' },
    });

    await expect(requireAuthenticatedUser(createRequest(token))).rejects.toMatchObject({
      code: 'AUTH_UNAUTHORIZED',
      status: 401,
    });
    expect(authRepositoryMock.getUserById).not.toHaveBeenCalled();
    expect(getUserMock).toHaveBeenCalledWith(token);
  });

  it('keeps requireAuthenticatedUser as a compatibility alias', async () => {
    authRepositoryMock.getUserById.mockResolvedValue(createAuthRecord());
    const { token } = createAccessToken(
      {
        authMethod: 'otp',
        needsOnboarding: false,
        phone: '13812345678',
        sub: 'user-1',
        type: 'access',
      },
      secret,
    );

    await expect(requireAuthenticatedUser(createRequest(token))).resolves.toMatchObject({
      user: {
        id: 'user-1',
      },
    });
  });
});
