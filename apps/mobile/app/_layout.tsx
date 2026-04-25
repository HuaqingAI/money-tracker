import { AUTH_ROUTE_PATHS } from '@money-tracker/shared';
import { UIProvider } from '@money-tracker/ui';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';

import { refreshSession } from '../lib/auth-api';
import { initSentry, Sentry } from '../lib/sentry';
import { useAuthStore } from '../stores/auth-store';

export const unstable_settings = {
  initialRouteName: 'index',
};

// 应用启动时初始化 Sentry（必须在渲染前调用）
initSentry();

function RootLayout() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const nextPath = useAuthStore((state) => state.getNextPath());
  const needsTokenRefresh = useAuthStore((state) => state.needsTokenRefresh());
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const segments = useSegments();
  const router = useRouter();
  const refreshingSessionRef = useRef(false);

  useEffect(() => {
    if (!hydrated || !needsTokenRefresh || !session?.refreshToken) {
      return;
    }

    let active = true;
    refreshingSessionRef.current = true;

    refreshSession({ refreshToken: session.refreshToken })
      .then((result) => {
        if (!active) {
          return;
        }

        setSession(result.session);
        router.replace(result.nextPath);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        clearSession();
        router.replace(AUTH_ROUTE_PATHS.register);
      })
      .finally(() => {
        refreshingSessionRef.current = false;
      });

    return () => {
      active = false;
    };
  }, [clearSession, hydrated, needsTokenRefresh, router, session?.refreshToken, setSession]);

  useEffect(() => {
    if (!hydrated || refreshingSessionRef.current || needsTokenRefresh) {
      return;
    }

    const activeGroup = segments[0];
    const currentPath =
      activeGroup === '(setup)'
        ? AUTH_ROUTE_PATHS.permissions
        : activeGroup === '(main)'
          ? AUTH_ROUTE_PATHS.dashboard
          : AUTH_ROUTE_PATHS.register;

    if (currentPath !== nextPath) {
      router.replace(nextPath);
    }
  }, [hydrated, needsTokenRefresh, nextPath, router, segments]);

  return (
    <UIProvider defaultTheme="light">
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </UIProvider>
  );
}

// Sentry.wrap 捕获 React 错误边界事件和未处理的 Promise rejection
export default Sentry.wrap(RootLayout);
