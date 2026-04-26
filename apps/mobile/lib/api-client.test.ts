import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        apiUrl: 'http://localhost:3000/',
      },
      hostUri: '192.168.1.20:8081',
    },
  },
}));

import { fetchUserProfile, updateProfile } from './api-client';

describe('api-client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('normalizes localhost API URLs for real device development', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            avatarUrl: null,
            birthday: null,
            consentAt: null,
            createdAt: null,
            gender: null,
            loginMethod: 'phone',
            maskedPhoneNumber: '138****5678',
            nickname: 'Sue',
            updatedAt: null,
            userId: 'user-1',
          },
        }),
      ),
    );

    await fetchUserProfile('access-token');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://192.168.1.20:3000/api/user/profile',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
        }),
        method: 'GET',
      }),
    );
  });

  it('updates profile through the configured API URL', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            avatarUrl: null,
            birthday: '1996-03-15',
            consentAt: null,
            createdAt: null,
            gender: 'female',
            loginMethod: 'phone',
            maskedPhoneNumber: '138****5678',
            nickname: 'New Name',
            updatedAt: null,
            userId: 'user-1',
          },
        }),
      ),
    );

    await updateProfile('access-token', {
      avatarUrl: null,
      birthday: '1996-03-15',
      gender: 'female',
      nickname: 'New Name',
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://192.168.1.20:3000/api/user/profile',
      expect.objectContaining({
        body: JSON.stringify({
          avatarUrl: null,
          birthday: '1996-03-15',
          gender: 'female',
          nickname: 'New Name',
        }),
        method: 'PUT',
      }),
    );
  });
});
