import { AUTH_ROUTE_PATHS } from '@money-tracker/shared';
import { UIProvider } from '@money-tracker/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import type { Href } from 'expo-router';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

import { refreshSession } from '../lib/auth-api';
import { getQueryClient } from '../lib/query-client';
import { initSentry, Sentry } from '../lib/sentry';
import { useAuthStore } from '../stores/auth-store';

export const unstable_settings = {
  initialRouteName: 'index',
};

initSentry();

function isRouteGroupAllowed(
  activeGroup: string | undefined,
  nextPath: string,
): boolean {
  if (nextPath === AUTH_ROUTE_PATHS.permissions) {
    return activeGroup === '(setup)';
  }

  if (
    nextPath === AUTH_ROUTE_PATHS.me ||
    nextPath === AUTH_ROUTE_PATHS.dashboard
  ) {
    return activeGroup === '(main)';
  }

  return activeGroup === '(auth)';
}

function RootLayout() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const nextPath = useAuthStore((state) => state.getNextPath());
  const needsTokenRefresh = useAuthStore((state) => state.needsTokenRefresh());
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const rootNavigationState = useRootNavigationState();
  const segments = useSegments();
  const activeGroup = segments[0];
  const router = useRouter();
  const refreshingSessionRef = useRef(false);
  const pendingNavigationTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const navigationReady = Boolean(rootNavigationState?.key);

  const replaceWhenReady = useCallback(
    (path: Href) => {
      let attempts = 0;

      const run = () => {
        try {
          router.replace(path);
        } catch (error) {
          attempts += 1;
          if (attempts > 6) {
            console.warn('Deferred navigation failed after root layout mount.', error);
            return;
          }

          const retryTimer = setTimeout(run, 50);
          pendingNavigationTimersRef.current.push(retryTimer);
        }
      };

      const timer = setTimeout(run, 0);
      pendingNavigationTimersRef.current.push(timer);
    },
    [router],
  );

  useEffect(
    () => () => {
      for (const timer of pendingNavigationTimersRef.current) {
        clearTimeout(timer);
      }
      pendingNavigationTimersRef.current = [];
    },
    [],
  );

  useEffect(() => {
    if (!navigationReady || !hydrated || !needsTokenRefresh || !session?.refreshToken) {
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
        replaceWhenReady(result.nextPath as Href);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        clearSession();
        replaceWhenReady(AUTH_ROUTE_PATHS.welcome as Href);
      })
      .finally(() => {
        refreshingSessionRef.current = false;
      });

    return () => {
      active = false;
    };
  }, [
    clearSession,
    hydrated,
    needsTokenRefresh,
    navigationReady,
    replaceWhenReady,
    session?.refreshToken,
    setSession,
  ]);

  useEffect(() => {
    if (!navigationReady || !hydrated || refreshingSessionRef.current || needsTokenRefresh) {
      return;
    }

    if (!isRouteGroupAllowed(activeGroup, nextPath)) {
      replaceWhenReady(nextPath as Href);
    }
  }, [activeGroup, hydrated, navigationReady, needsTokenRefresh, nextPath, replaceWhenReady]);

  return (
    <QueryClientProvider client={getQueryClient()}>
      <UIProvider defaultTheme="light">
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(setup)" />
          <Stack.Screen name="(main)" />
        </Stack>
      </UIProvider>
    </QueryClientProvider>
  );
}

export default Sentry.wrap(RootLayout);
