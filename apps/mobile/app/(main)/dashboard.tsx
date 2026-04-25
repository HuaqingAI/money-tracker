import { Button, Text } from '@money-tracker/ui';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

import { useAuthStore } from '../../stores/auth-store';

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.authUser);
  const clearSession = useAuthStore((state) => state.clearSession);
  const displayName = user?.displayName ?? user?.phone ?? 'Signed-in user';

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack
        backgroundColor="$surfacePage"
        flex={1}
        gap="$4"
        justifyContent="center"
        paddingHorizontal="$4"
        paddingVertical="$5"
      >
        <Text variant="h1">Dashboard</Text>
        <Text variant="body">Welcome back, {displayName}</Text>
        <Button onPress={() => router.push('/(main)/me')}>我的</Button>
        <Button onPress={clearSession}>Log Out</Button>
      </YStack>
    </SafeAreaView>
  );
}
