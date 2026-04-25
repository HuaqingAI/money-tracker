import { AUTH_ROUTE_PATHS } from '@money-tracker/shared';
import { UIProvider } from '@money-tracker/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';

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

    if (!isRouteGroupAllowed(segments[0], nextPath)) {
      router.replace(nextPath);
    }
  }, [hydrated, needsTokenRefresh, nextPath, router, segments]);

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
