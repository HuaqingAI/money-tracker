import { Button, Text } from '@money-tracker/ui';
import { Redirect, router } from 'expo-router';
import { YStack } from 'tamagui';

import { useAuthStore } from '../stores/auth-store';

export default function HomeScreen() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  if (hasHydrated && accessToken) {
    return <Redirect href="/me" />;
  }

  return (
    <YStack
      alignItems="center"
      backgroundColor="$surfacePage"
      flex={1}
      gap="$4"
      justifyContent="center"
      padding="$4"
    >
      <Text variant="h1">Money Tracker</Text>
      <Text variant="caption">
        Story 1.8 wires the account area, profile editing, settings, and delete-account flow.
      </Text>
      <Text variant="caption">
        When a local JWT exists, the app redirects into the account area automatically.
      </Text>
      <Button onPress={() => router.push('/me')}>Open Account Area</Button>
    </YStack>
  );
}
