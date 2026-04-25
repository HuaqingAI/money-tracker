import { beforeEach, describe, expect, it, vi } from 'vitest';

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
      user: null,
    });
  });

  it('stores session fields and computes next path', () => {
    useAuthStore.getState().setSession({
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
        needsOnboarding: true,
      },
    });

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access');
    expect(state.getNextPath()).toBe('/(setup)/permissions');
  });

  it('clears session state', () => {
    useAuthStore.getState().setSession({
      accessToken: 'access',
      refreshToken: 'refresh',
      accessTokenExpiresAt: '2026-04-24T00:15:00.000Z',
      refreshTokenExpiresAt: '2026-05-01T00:00:00.000Z',
      user: {
        id: 'user-1',
        phone: '13800138000',
        displayName: null,
        consentAt: '2026-04-24T00:00:00.000Z',
        lastSignInAt: '2026-04-24T00:00:00.000Z',
        authMethod: 'otp',
        needsOnboarding: false,
      },
    });

    useAuthStore.getState().clearSession();

    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.getNextPath()).toBe('/(auth)/register');
  });

  it('routes expired sessions back to registration', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-24T00:20:00.000Z'));

    useAuthStore.getState().setSession({
      accessToken: 'access',
      refreshToken: 'refresh',
      accessTokenExpiresAt: '2026-04-24T00:10:00.000Z',
      refreshTokenExpiresAt: '2026-04-24T00:19:00.000Z',
      user: {
        id: 'user-1',
        phone: '13800138000',
        displayName: null,
        consentAt: '2026-04-24T00:00:00.000Z',
        lastSignInAt: '2026-04-24T00:00:00.000Z',
        authMethod: 'otp',
        needsOnboarding: false,
      },
    });

    expect(useAuthStore.getState().getNextPath()).toBe('/(auth)/register');
    expect(useAuthStore.getState().needsTokenRefresh()).toBe(false);
  });

  it('marks sessions with expired access tokens as refreshable', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-24T00:20:00.000Z'));

    useAuthStore.getState().setSession({
      accessToken: 'access',
      refreshToken: 'refresh',
      accessTokenExpiresAt: '2026-04-24T00:10:00.000Z',
      refreshTokenExpiresAt: '2026-04-25T00:00:00.000Z',
      user: {
        id: 'user-1',
        phone: '13800138000',
        displayName: null,
        consentAt: '2026-04-24T00:00:00.000Z',
        lastSignInAt: '2026-04-24T00:00:00.000Z',
        authMethod: 'otp',
        needsOnboarding: false,
      },
    });

    expect(useAuthStore.getState().needsTokenRefresh()).toBe(true);
    expect(useAuthStore.getState().getNextPath()).toBe('/(auth)/register');
  });

  it('recovers from hydration errors', () => {
    useAuthStore.getState().setSession({
      accessToken: 'access',
      refreshToken: 'refresh',
      accessTokenExpiresAt: '2026-04-24T00:15:00.000Z',
      refreshTokenExpiresAt: '2026-05-01T00:00:00.000Z',
      user: {
        id: 'user-1',
        phone: '13800138000',
        displayName: null,
        consentAt: '2026-04-24T00:00:00.000Z',
        lastSignInAt: '2026-04-24T00:00:00.000Z',
        authMethod: 'otp',
        needsOnboarding: false,
      },
    });

    useAuthStore.getState().recoverFromHydrationError();

    const state = useAuthStore.getState();
    expect(state.hydrated).toBe(true);
    expect(state.session).toBeNull();
    expect(state.getNextPath()).toBe('/(auth)/register');
  });
});
