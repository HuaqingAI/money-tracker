import { Button, Text } from '@money-tracker/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Alert, ScrollView, View } from 'react-native';
import { YStack } from 'tamagui';

import { ApiClientError, deleteAccount } from '../../lib/api-client';
import { getAppVersion } from '../../lib/runtime-config';
import { clearClientSession } from '../../lib/session';
import { useAuthStore } from '../../stores/auth-store';

function Divider() {
  return (
    <View
      style={{
        backgroundColor: '#E5E7EB',
        height: 1,
        width: '100%',
      }}
    />
  );
}

export default function SettingsScreen() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const loginMethod = useAuthStore((state) => state.user.loginMethod);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteAccount(accessToken as string),
    onSuccess: async () => {
      queryClient.clear();
      await clearClientSession();
      router.replace('/');
    },
  });

  async function onLogout(): Promise<void> {
    queryClient.clear();
    await clearClientSession();
    router.replace('/');
  }

  function confirmLogout(): void {
    Alert.alert('Log out', 'Do you want to log out of the current account?', [
      { style: 'cancel', text: 'Cancel' },
      {
        style: 'destructive',
        text: 'Log out',
        onPress: () => {
          void onLogout();
        },
      },
    ]);
  }

  function confirmDeleteAccount(): void {
    Alert.alert(
      'Delete account',
      'This permanently removes the account and related data.',
      [
        { style: 'cancel', text: 'Cancel' },
        {
          style: 'destructive',
          text: deleteMutation.isPending ? 'Deleting...' : 'Delete',
          onPress: () => {
            deleteMutation.mutate(undefined, {
              onError: (error) => {
                const message =
                  error instanceof ApiClientError ? error.message : 'Failed to delete account.';
                Alert.alert('Delete failed', message);
              },
            });
          },
        },
      ],
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <YStack
        backgroundColor="$surfacePrimary"
        borderColor="$neutral200"
        borderRadius="$lg"
        borderWidth={1}
        gap="$3"
        padding="$4"
      >
        <Text variant="bodyMedium">Basic Settings</Text>
        <Divider />

        <Button onPress={() => router.push('/privacy')}>Privacy Summary</Button>
        <Text variant="caption">Login method: {loginMethod}</Text>
        <Text variant="caption">App version: {getAppVersion()}</Text>

        <Divider />
        <Button onPress={confirmDeleteAccount}>
          {deleteMutation.isPending ? 'Deleting...' : 'Delete Account'}
        </Button>
        <Button onPress={confirmLogout}>Log Out</Button>
      </YStack>
    </ScrollView>
  );
}
