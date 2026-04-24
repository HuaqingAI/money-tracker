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

function getNextPathFromSession(session: AuthSession | null): AuthRoutePath {
  if (!session) {
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
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);
