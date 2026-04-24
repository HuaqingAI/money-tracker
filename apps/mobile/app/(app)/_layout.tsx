import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { YStack } from 'tamagui';

import { useAuthStore } from '../../stores/auth-store';

export default function AccountLayout() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return (
      <YStack
        alignItems="center"
        backgroundColor="$surfacePage"
        flex={1}
        justifyContent="center"
      >
        <ActivityIndicator />
      </YStack>
    );
  }

  if (!accessToken) {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: '#F9FAFB',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="me"
        options={{
          title: '我的',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: '编辑资料',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: '设置',
        }}
      />
      <Stack.Screen
        name="privacy"
        options={{
          title: '隐私协议',
        }}
      />
    </Stack>
  );
}
