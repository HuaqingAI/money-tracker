import { Button, Text } from '@money-tracker/ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

import { useAuthStore } from '../../stores/auth-store';

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack
        flex={1}
        backgroundColor="$surfacePage"
        paddingHorizontal="$4"
        paddingVertical="$5"
        gap="$4"
        justifyContent="center"
      >
        <Text variant="h1">Dashboard</Text>
        <Text variant="body">
          {user?.displayName
            ? `欢迎回来，${user.displayName}`
            : `欢迎回来，${user?.phone ?? '已登录用户'}`}
        </Text>
        <Button onPress={clearSession}>退出登录</Button>
      </YStack>
    </SafeAreaView>
  );
}
