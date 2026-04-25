import {
  AUTH_ROUTE_PATHS,
  type AuthRoutePath,
  type AuthSession,
  type AuthUser,
  type LoginMethod,
  type UserProfile,
} from '@money-tracker/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const AUTH_STORAGE_KEY = 'money-tracker/auth-session';

export interface AuthSummary {
  avatarUrl: string | null;
  loginMethod: LoginMethod;
  nickname: string | null;
  userId: string | null;
}

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

function toLoginMethod(authMethod: AuthUser['authMethod']): LoginMethod {
  return authMethod === 'wechat' ? 'wechat' : 'phone';
}

function toAuthSummary(user: AuthUser): AuthSummary {
  return {
    avatarUrl: null,
    loginMethod: toLoginMethod(user.authMethod),
    nickname: user.displayName,
    userId: user.id,
  };
}

function getNextPathFromSession(session: AuthSession | null): AuthRoutePath {
  if (!hasActiveSession(session)) {
    return AUTH_ROUTE_PATHS.register;
  }

  return session.user.needsOnboarding ? AUTH_ROUTE_PATHS.permissions : AUTH_ROUTE_PATHS.me;
}

const initialUser: AuthSummary = {
  avatarUrl: null,
  loginMethod: 'unknown',
  nickname: null,
  userId: null,
};

export interface AuthState {
  hydrated: boolean;
  session: AuthSession | null;
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthSummary;
  authUser: AuthUser | null;
  setSession: (session: AuthSession) => void;
  setUserProfile: (profile: UserProfile) => void;
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
      user: initialUser,
      authUser: null,
      setSession: (session) =>
        set((state) => ({
          session,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          user: {
            ...toAuthSummary(session.user),
            avatarUrl: state.user.avatarUrl,
          },
          authUser: session.user,
        })),
      setUserProfile: (profile) =>
        set((state) => ({
          ...state,
          user: {
            avatarUrl: profile.avatarUrl,
            loginMethod: profile.loginMethod,
            nickname: profile.nickname,
            userId: profile.userId,
          },
        })),
      clearSession: () =>
        set({
          session: null,
          accessToken: null,
          refreshToken: null,
          user: initialUser,
          authUser: null,
        }),
      markHydrated: () => set({ hydrated: true }),
      recoverFromHydrationError: () =>
        set({
          hydrated: true,
          session: null,
          accessToken: null,
          refreshToken: null,
          user: initialUser,
          authUser: null,
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
        authUser: state.authUser,
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
