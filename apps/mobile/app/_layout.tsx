import { UIProvider } from '@money-tracker/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';

import { getQueryClient } from '../lib/query-client';
import { initSentry, Sentry } from '../lib/sentry';

// 应用启动时初始化 Sentry（必须在渲染前调用）
initSentry();

function RootLayout() {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <UIProvider defaultTheme="light">
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(app)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </UIProvider>
    </QueryClientProvider>
  );
}

// Sentry.wrap 捕获 React 错误边界事件和未处理的 Promise rejection
export default Sentry.wrap(RootLayout);
