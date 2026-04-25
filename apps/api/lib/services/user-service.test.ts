import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const userRepositoryMock = vi.hoisted(() => ({
  deleteUserById: vi.fn<(...args: never[]) => Promise<void>>(),
  getUserProfileByUserId: vi.fn<(...args: never[]) => Promise<unknown>>(),
  saveUserProfile: vi.fn<(...args: never[]) => Promise<unknown>>(),
}));

vi.mock('../db/repositories/user-repo', () => ({
  userRepository: userRepositoryMock,
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

describe('user-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps a user profile with masked phone number', async () => {
    userRepositoryMock.getUserProfileByUserId.mockResolvedValue({
      avatar_url: 'https://example.com/avatar.png',
      consent_at: '2026-04-20T00:00:00.000Z',
      created_at: '2026-04-20T00:00:00.000Z',
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
      consentAt: '2026-04-20T00:00:00.000Z',
      createdAt: '2026-04-20T00:00:00.000Z',
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
      consent_at: '2026-04-19T00:00:00.000Z',
      created_at: '2026-04-19T00:00:00.000Z',
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
      consent_at: '2026-04-19T00:00:00.000Z',
      created_at: '2026-04-19T00:00:00.000Z',
      id: 'profile-1',
      nickname: 'New',
      phone_number: null,
      updated_at: '2026-04-24T00:00:00.000Z',
      user_id: 'user-1',
      wechat_openid: null,
      wechat_unionid: null,
    });

    const result = await updateUserProfile(createAuthUser(), {
      avatarUrl: null,
      nickname: 'New',
    });

    expect(userRepositoryMock.saveUserProfile).toHaveBeenCalledWith({
      avatarUrl: null,
      consentAt: '2026-04-19T00:00:00.000Z',
      nickname: 'New',
      userId: 'user-1',
    });
    expect(result.nickname).toBe('New');
  });

  it('deletes the authenticated user account', async () => {
    userRepositoryMock.deleteUserById.mockResolvedValue(undefined);

    await deleteUserAccount(createAuthUser());

    expect(userRepositoryMock.deleteUserById).toHaveBeenCalledWith('user-1');
  });
});
