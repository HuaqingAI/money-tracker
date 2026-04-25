import {
  AUTH_ROUTE_PATHS,
  type AuthRoutePath,
  type AuthSession,
  type AuthUser,
} from '@money-tracker/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const AUTH_STORAGE_KEY = 'money-tracker/auth-session';

function hasExpired(isoDate: string): boolean {
  const timestamp = new Date(isoDate).getTime();
  return Number.isNaN(timestamp) || timestamp <= Date.now();
}

function hasActiveSession(session: AuthSession | null): session is AuthSession {
  if (!session) {
    return false;
  }

  return !hasExpired(session.refreshTokenExpiresAt) && !hasExpired(session.accessTokenExpiresAt);
}

function canRefreshSession(session: AuthSession | null): session is AuthSession {
  if (!session) {
    return false;
  }

  return hasExpired(session.accessTokenExpiresAt) && !hasExpired(session.refreshTokenExpiresAt);
}

function hasRefreshableOrActiveSession(session: AuthSession | null): session is AuthSession {
  return hasActiveSession(session) || canRefreshSession(session);
}

function getNextPathFromSession(session: AuthSession | null): AuthRoutePath {
  if (!hasActiveSession(session)) {
    return AUTH_ROUTE_PATHS.register;
  }

  return session.user.needsOnboarding ? AUTH_ROUTE_PATHS.permissions : AUTH_ROUTE_PATHS.dashboard;
}

export interface AuthState {
  hydrated: boolean;
  session: AuthSession | null;
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  markHydrated: () => void;
  recoverFromHydrationError: () => void;
  needsTokenRefresh: () => boolean;
  getNextPath: () => AuthRoutePath;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      session: null,
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: (session) =>
        set({
          session,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          user: session.user,
        }),
      clearSession: () =>
        set({
          session: null,
          accessToken: null,
          refreshToken: null,
          user: null,
        }),
      markHydrated: () => set({ hydrated: true }),
      recoverFromHydrationError: () =>
        set({
          hydrated: true,
          session: null,
          accessToken: null,
          refreshToken: null,
          user: null,
        }),
      needsTokenRefresh: () => canRefreshSession(get().session),
      getNextPath: () => getNextPathFromSession(get().session),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        session: state.session,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) {
          useAuthStore.getState().recoverFromHydrationError();
          return;
        }

        if (!hasRefreshableOrActiveSession(state.session)) {
          state.clearSession();
        }

        state.markHydrated();
      },
    },
  ),
);
