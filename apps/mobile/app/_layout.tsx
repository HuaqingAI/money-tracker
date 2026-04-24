import { UIProvider } from '@money-tracker/ui';
import { Stack } from 'expo-router';

import { initSentry, Sentry } from '../lib/sentry';

export const unstable_settings = {
  initialRouteName: 'index',
};

// 应用启动时初始化 Sentry（必须在渲染前调用）
initSentry();

function RootLayout() {
  return (
    <UIProvider defaultTheme="light">
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </UIProvider>
  );
}

// Sentry.wrap 捕获 React 错误边界事件和未处理的 Promise rejection
export default Sentry.wrap(RootLayout);
