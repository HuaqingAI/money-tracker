import type { LoginMethod, UserProfile } from '@money-tracker/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface AuthSummary {
  avatarUrl: string | null;
  loginMethod: LoginMethod;
  nickname: string | null;
  userId: string | null;
}

interface AuthSessionInput {
  accessToken: string;
  loginMethod?: LoginMethod;
  refreshToken?: string | null;
  user?: Partial<AuthSummary>;
}

interface AuthState {
  accessToken: string | null;
  hasHydrated: boolean;
  refreshToken: string | null;
  user: AuthSummary;
  clearSession: () => void;
  markHydrated: (value: boolean) => void;
  setSession: (session: AuthSessionInput) => void;
  setUserProfile: (profile: UserProfile) => void;
}

const initialUser: AuthSummary = {
  avatarUrl: null,
  loginMethod: 'unknown',
  nickname: null,
  userId: null,
};

function createInitialState(): Omit<
  AuthState,
  'clearSession' | 'markHydrated' | 'setSession' | 'setUserProfile'
> {
  return {
    accessToken: null,
    hasHydrated: false,
    refreshToken: null,
    user: initialUser,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...createInitialState(),
      clearSession: () =>
        set(() => ({
          ...createInitialState(),
          hasHydrated: true,
        })),
      markHydrated: (value) =>
        set((state) => ({
          ...state,
          hasHydrated: value,
        })),
      setSession: (session) =>
        set((state) => ({
          ...state,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken ?? null,
          user: {
            avatarUrl: session.user?.avatarUrl ?? state.user.avatarUrl,
            loginMethod: session.loginMethod ?? state.user.loginMethod,
            nickname: session.user?.nickname ?? state.user.nickname,
            userId: session.user?.userId ?? state.user.userId,
          },
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
    }),
    {
      name: 'money-tracker-auth',
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          state?.clearSession();
          return;
        }

        state?.markHydrated(true);
      },
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      skipHydration: true,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export async function hydrateAuthStore(): Promise<void> {
  if (useAuthStore.getState().hasHydrated) {
    return;
  }

  try {
    await useAuthStore.persist.rehydrate();
  } catch {
    useAuthStore.getState().clearSession();
  } finally {
    useAuthStore.getState().markHydrated(true);
  }
}

