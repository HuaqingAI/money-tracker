import { beforeEach, describe, expect, it, vi } from 'vitest';

const memoryStorage = new Map<string, string>();

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    clear: vi.fn(async () => {
      memoryStorage.clear();
    }),
    getItem: vi.fn(async (key: string) => memoryStorage.get(key) ?? null),
    removeItem: vi.fn(async (key: string) => {
      memoryStorage.delete(key);
    }),
    setItem: vi.fn(async (key: string, value: string) => {
      memoryStorage.set(key, value);
    }),
  },
}));

import { hydrateAuthStore, useAuthStore } from './auth-store';

describe('auth-store', () => {
  beforeEach(async () => {
    memoryStorage.clear();
    useAuthStore.getState().clearSession();
    await useAuthStore.persist.clearStorage();
    useAuthStore.getState().markHydrated(false);
  });

  it('stores an authenticated session', () => {
    useAuthStore.getState().setSession({
      accessToken: 'access-token',
      loginMethod: 'phone',
      refreshToken: 'refresh-token',
      user: {
        nickname: 'Sue',
        userId: 'user-1',
      },
    });

    const state = useAuthStore.getState();

    expect(state.accessToken).toBe('access-token');
    expect(state.refreshToken).toBe('refresh-token');
    expect(state.user.nickname).toBe('Sue');
    expect(state.user.loginMethod).toBe('phone');
  });

  it('updates the profile summary from fetched user data', () => {
    useAuthStore.getState().setUserProfile({
      avatarUrl: 'https://example.com/avatar.png',
      consentAt: null,
      createdAt: null,
      loginMethod: 'wechat',
      maskedPhoneNumber: '138****5678',
      nickname: 'Profile User',
      updatedAt: null,
      userId: 'user-1',
    });

    const state = useAuthStore.getState();

    expect(state.user).toEqual({
      avatarUrl: 'https://example.com/avatar.png',
      loginMethod: 'wechat',
      nickname: 'Profile User',
      userId: 'user-1',
    });
  });

  it('clears the session', () => {
    useAuthStore.getState().setSession({
      accessToken: 'access-token',
      user: {
        userId: 'user-1',
      },
    });

    useAuthStore.getState().clearSession();

    const state = useAuthStore.getState();

    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user.userId).toBeNull();
  });

  it('marks the store hydrated when rehydrate completes', async () => {
    await hydrateAuthStore();

    expect(useAuthStore.getState().hasHydrated).toBe(true);
  });
});
