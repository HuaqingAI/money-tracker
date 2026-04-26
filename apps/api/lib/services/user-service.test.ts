import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const userRepositoryMock = vi.hoisted(() => ({
  deleteUserById: vi.fn<(...args: never[]) => Promise<void>>(),
  getUserProfileByUserId: vi.fn<(...args: never[]) => Promise<unknown>>(),
  saveUserProfile: vi.fn<(...args: never[]) => Promise<unknown>>(),
  updateAuthUserMetadata: vi.fn<(...args: never[]) => Promise<unknown>>(),
}));

const authRepositoryMock = vi.hoisted(() => ({
  getUserById: vi.fn<(...args: never[]) => Promise<unknown>>(),
  updateUserProfile: vi.fn<(...args: never[]) => Promise<unknown>>(),
  upsertUserProfileSnapshot: vi.fn<(...args: never[]) => Promise<unknown>>(),
}));

vi.mock('../db/repositories/user-repo', () => ({
  userRepository: userRepositoryMock,
}));

vi.mock('../auth/repository', () => ({
  getAuthRepository: () => authRepositoryMock,
}));

import { deleteUserAccount, getUserProfile, updateUserProfile } from './user-service';

function createAuthUser(overrides: Partial<User> = {}): User {
  return {
    app_metadata: {
      provider: 'phone',
      providers: ['phone'],
    },
    aud: 'authenticated',
    created_at: '2026-04-24T00:00:00.000Z',
    id: 'user-1',
    phone: '13812345678',
    updated_at: '2026-04-24T00:00:00.000Z',
    user_metadata: {},
    ...overrides,
  } as User;
}

function createAppAuthUser(overrides: Partial<User> = {}): User {
  return createAuthUser({
    app_metadata: {
      app_auth: true,
      provider: 'phone',
      providers: ['phone'],
    },
    ...overrides,
  });
}

describe('user-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authRepositoryMock.updateUserProfile.mockResolvedValue(null);
    authRepositoryMock.upsertUserProfileSnapshot.mockResolvedValue(null);
  });

  it('maps a user profile with masked phone number', async () => {
    userRepositoryMock.getUserProfileByUserId.mockResolvedValue({
      avatar_url: 'https://example.com/avatar.png',
      birthday: '1990-05-20',
      consent_at: '2026-04-20T00:00:00.000Z',
      created_at: '2026-04-20T00:00:00.000Z',
      gender: 'female',
      id: 'profile-1',
      nickname: 'Sue',
      phone_number: null,
      updated_at: '2026-04-21T00:00:00.000Z',
      user_id: 'user-1',
      wechat_openid: null,
      wechat_unionid: null,
    });

    const result = await getUserProfile(createAuthUser());

    expect(result).toEqual({
      avatarUrl: 'https://example.com/avatar.png',
      birthday: '1990-05-20',
      consentAt: '2026-04-20T00:00:00.000Z',
      createdAt: '2026-04-20T00:00:00.000Z',
      gender: 'female',
      loginMethod: 'phone',
      maskedPhoneNumber: '138****5678',
      nickname: 'Sue',
      updatedAt: '2026-04-21T00:00:00.000Z',
      userId: 'user-1',
    });
  });

  it('reuses existing consent time when updating a profile', async () => {
    userRepositoryMock.getUserProfileByUserId.mockResolvedValueOnce({
      avatar_url: null,
      birthday: null,
      consent_at: '2026-04-19T00:00:00.000Z',
      created_at: '2026-04-19T00:00:00.000Z',
      gender: null,
      id: 'profile-1',
      nickname: 'Old',
      phone_number: null,
      updated_at: '2026-04-19T00:00:00.000Z',
      user_id: 'user-1',
      wechat_openid: null,
      wechat_unionid: null,
    });
    userRepositoryMock.saveUserProfile.mockResolvedValue({
      avatar_url: null,
      birthday: '1996-03-15',
      consent_at: '2026-04-19T00:00:00.000Z',
      created_at: '2026-04-19T00:00:00.000Z',
      gender: 'female',
      id: 'profile-1',
      nickname: 'New',
      phone_number: null,
      updated_at: '2026-04-24T00:00:00.000Z',
      user_id: 'user-1',
      wechat_openid: null,
      wechat_unionid: null,
    });
    userRepositoryMock.updateAuthUserMetadata.mockResolvedValue({
      ...createAuthUser(),
      user_metadata: {
        avatar_url: null,
        nickname: 'New',
      },
    });

    const result = await updateUserProfile(createAuthUser(), {
      avatarUrl: null,
      birthday: '1996-03-15',
      gender: 'female',
      nickname: 'New',
    });

    expect(userRepositoryMock.saveUserProfile).toHaveBeenCalledWith({
      avatarUrl: null,
      birthday: '1996-03-15',
      consentAt: '2026-04-19T00:00:00.000Z',
      gender: 'female',
      nickname: 'New',
      userId: 'user-1',
    });
    expect(userRepositoryMock.updateAuthUserMetadata).toHaveBeenCalledWith('user-1', {
      avatar_url: null,
      birthday: '1996-03-15',
      gender: 'female',
      nickname: 'New',
    });
    expect(result.nickname).toBe('New');
  });

  it('updates in-memory auth users without requiring Supabase metadata writes', async () => {
    userRepositoryMock.getUserProfileByUserId.mockRejectedValue(
      new Error('schema auth is not exposed'),
    );
    authRepositoryMock.updateUserProfile.mockResolvedValue({
      authMethod: 'otp',
      avatarUrl: 'file:///avatar.jpg',
      birthday: '1996-03-15',
      consentAt: '2026-04-19T00:00:00.000Z',
      createdAt: '2026-04-24T00:00:00.000Z',
      displayName: 'Local User',
      gender: 'female',
      id: 'user-1',
      lastSignInAt: '2026-04-24T00:00:00.000Z',
      needsOnboarding: false,
      phone: '13812345678',
      updatedAt: '2026-04-24T00:10:00.000Z',
    });
    userRepositoryMock.saveUserProfile.mockRejectedValue(
      new Error('schema auth is not exposed'),
    );

    const result = await updateUserProfile(createAuthUser(), {
      avatarUrl: 'file:///avatar.jpg',
      birthday: '1996-03-15',
      gender: 'female',
      nickname: 'Local User',
    });

    expect(authRepositoryMock.updateUserProfile).toHaveBeenCalledWith('user-1', {
      avatarUrl: 'file:///avatar.jpg',
      birthday: '1996-03-15',
      displayName: 'Local User',
      gender: 'female',
      now: expect.any(Date),
    });
    expect(userRepositoryMock.updateAuthUserMetadata).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      avatarUrl: 'file:///avatar.jpg',
      birthday: '1996-03-15',
      gender: 'female',
      nickname: 'Local User',
    });
  });

  it('updates verified app auth users when the in-memory auth record is unavailable', async () => {
    userRepositoryMock.getUserProfileByUserId.mockRejectedValue(
      new Error('schema auth is not exposed'),
    );
    authRepositoryMock.updateUserProfile.mockResolvedValue(null);
    authRepositoryMock.upsertUserProfileSnapshot.mockResolvedValue({
      authMethod: 'otp',
      avatarUrl: 'file:///avatar.jpg',
      birthday: '1996-03-15',
      consentAt: '2026-04-24T00:00:00.000Z',
      createdAt: '2026-04-24T00:00:00.000Z',
      displayName: 'Token User',
      gender: 'undisclosed',
      id: 'user-1',
      lastSignInAt: '2026-04-24T00:00:00.000Z',
      needsOnboarding: false,
      phone: '13812345678',
      updatedAt: '2026-04-24T00:10:00.000Z',
    });
    userRepositoryMock.saveUserProfile.mockRejectedValue(
      new Error('schema auth is not exposed'),
    );

    const result = await updateUserProfile(createAppAuthUser(), {
      avatarUrl: 'file:///avatar.jpg',
      birthday: '1996-03-15',
      gender: 'undisclosed',
      nickname: 'Token User',
    });

    expect(authRepositoryMock.upsertUserProfileSnapshot).toHaveBeenCalledWith({
      userId: 'user-1',
      phone: '13812345678',
      authMethod: 'otp',
      consentAt: '2026-04-24T00:00:00.000Z',
      displayName: 'Token User',
      avatarUrl: 'file:///avatar.jpg',
      gender: 'undisclosed',
      birthday: '1996-03-15',
      createdAt: '2026-04-24T00:00:00.000Z',
      now: expect.any(Date),
    });
    expect(userRepositoryMock.updateAuthUserMetadata).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      avatarUrl: 'file:///avatar.jpg',
      birthday: '1996-03-15',
      gender: 'undisclosed',
      nickname: 'Token User',
    });
  });

  it('deletes the authenticated user account', async () => {
    userRepositoryMock.deleteUserById.mockResolvedValue(undefined);

    await deleteUserAccount(createAuthUser());

    expect(userRepositoryMock.deleteUserById).toHaveBeenCalledWith('user-1');
  });
});
