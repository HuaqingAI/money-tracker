import { AUTH_ROUTE_PATHS } from '@money-tracker/shared';
import { UIProvider } from '@money-tracker/ui';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

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
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) {
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
  }, [hydrated, nextPath, router, segments]);

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
