import type { AuthSession } from '@money-tracker/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const storage = new Map<string, string>();

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      storage.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      storage.delete(key);
    }),
  },
}));

import { useAuthStore } from './auth-store';

function createSession(overrides: Partial<AuthSession> = {}): AuthSession {
  return {
    accessToken: 'access',
    refreshToken: 'refresh',
    accessTokenExpiresAt: '2026-04-24T00:15:00.000Z',
    refreshTokenExpiresAt: '2026-05-01T00:00:00.000Z',
    user: {
      id: 'user-1',
      phone: '13800138000',
      displayName: 'Sue',
      consentAt: '2026-04-24T00:00:00.000Z',
      lastSignInAt: '2026-04-24T00:00:00.000Z',
      authMethod: 'otp',
      needsOnboarding: false,
    },
    ...overrides,
  };
}

describe('auth-store', () => {
  beforeEach(() => {
    storage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-24T00:00:00.000Z'));
    useAuthStore.setState({
      hydrated: true,
      session: null,
      accessToken: null,
      refreshToken: null,
      user: {
        avatarUrl: null,
        loginMethod: 'unknown',
        nickname: null,
        userId: null,
      },
      authUser: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stores session fields and routes onboarded users to the account area', () => {
    useAuthStore.getState().setSession(createSession());

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access');
    expect(state.authUser?.id).toBe('user-1');
    expect(state.user).toMatchObject({
      loginMethod: 'phone',
      nickname: 'Sue',
      userId: 'user-1',
    });
    expect(state.getNextPath()).toBe('/(main)/me');
  });

  it('routes users with pending onboarding to permissions', () => {
    useAuthStore.getState().setSession(
      createSession({
        user: {
          ...createSession().user,
          needsOnboarding: true,
        },
      }),
    );

    expect(useAuthStore.getState().getNextPath()).toBe('/(setup)/permissions');
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

    expect(useAuthStore.getState().user).toEqual({
      avatarUrl: 'https://example.com/avatar.png',
      loginMethod: 'wechat',
      nickname: 'Profile User',
      userId: 'user-1',
    });
  });

  it('clears session state', () => {
    useAuthStore.getState().setSession(createSession());

    useAuthStore.getState().clearSession();

    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user.userId).toBeNull();
    expect(state.getNextPath()).toBe('/(auth)/register');
  });

  it('routes expired sessions back to registration', () => {
    vi.setSystemTime(new Date('2026-04-24T00:20:00.000Z'));

    useAuthStore.getState().setSession(
      createSession({
        accessTokenExpiresAt: '2026-04-24T00:10:00.000Z',
        refreshTokenExpiresAt: '2026-04-24T00:19:00.000Z',
      }),
    );

    expect(useAuthStore.getState().getNextPath()).toBe('/(auth)/register');
    expect(useAuthStore.getState().needsTokenRefresh()).toBe(false);
  });

  it('marks sessions with expired access tokens as refreshable', () => {
    vi.setSystemTime(new Date('2026-04-24T00:20:00.000Z'));

    useAuthStore.getState().setSession(
      createSession({
        accessTokenExpiresAt: '2026-04-24T00:10:00.000Z',
        refreshTokenExpiresAt: '2026-04-25T00:00:00.000Z',
      }),
    );

    expect(useAuthStore.getState().needsTokenRefresh()).toBe(true);
    expect(useAuthStore.getState().getNextPath()).toBe('/(auth)/register');
  });

  it('recovers from hydration errors', () => {
    useAuthStore.getState().setSession(createSession());

    useAuthStore.getState().recoverFromHydrationError();

    const state = useAuthStore.getState();
    expect(state.hydrated).toBe(true);
    expect(state.session).toBeNull();
    expect(state.getNextPath()).toBe('/(auth)/register');
  });
});
