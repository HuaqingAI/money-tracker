import { Button, Text } from '@money-tracker/ui';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, View } from 'react-native';
import { XStack, YStack } from 'tamagui';

import { fetchUserProfile } from '../../lib/api-client';
import { clearClientSession } from '../../lib/session';
import { useAuthStore } from '../../stores/auth-store';

function AccountCard({ children }: { children: ReactNode }) {
  return (
    <YStack
      backgroundColor="$surfacePrimary"
      borderColor="$neutral200"
      borderRadius="$lg"
      borderWidth={1}
      gap="$3"
      padding="$4"
    >
      {children}
    </YStack>
  );
}

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

export default function MeScreen() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const summary = useAuthStore((state) => state.user);
  const setUserProfile = useAuthStore((state) => state.setUserProfile);

  const profileQuery = useQuery({
    enabled: !!accessToken,
    queryFn: async () => {
      const profile = await fetchUserProfile(accessToken as string);
      setUserProfile(profile);
      return profile;
    },
    queryKey: ['user-profile'],
  });

  const profile = profileQuery.data;
  const nickname = profile?.nickname ?? summary.nickname ?? 'Unnamed User';
  const maskedPhoneNumber = profile?.maskedPhoneNumber ?? 'No phone linked';
  const avatarLabel = (nickname.trim().charAt(0) || 'U').toUpperCase();

  async function onLogout(): Promise<void> {
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

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <YStack gap="$4">
        <AccountCard>
          <XStack alignItems="center" gap="$4">
            {profile?.avatarUrl ? (
              <Image
                source={{ uri: profile.avatarUrl }}
                style={{
                  backgroundColor: '#E0E7FF',
                  borderRadius: 32,
                  height: 64,
                  width: 64,
                }}
              />
            ) : (
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: '#E0E7FF',
                  borderRadius: 32,
                  height: 64,
                  justifyContent: 'center',
                  width: 64,
                }}
              >
                <Text variant="h2">{avatarLabel}</Text>
              </View>
            )}

            <YStack flex={1} gap="$1">
              <Text variant="h2">{nickname}</Text>
              <Text variant="caption">{maskedPhoneNumber}</Text>
              <Text variant="caption">
                Login method: {profile?.loginMethod ?? summary.loginMethod}
              </Text>
            </YStack>
          </XStack>

          {profileQuery.isLoading ? <ActivityIndicator /> : null}
          {profileQuery.error ? (
            <Text variant="caption">
              Failed to load profile data. Please retry with a valid session.
            </Text>
          ) : null}
        </AccountCard>

        <AccountCard>
          <Text variant="bodyMedium">Account</Text>
          <Divider />
          <Button onPress={() => router.push('/(main)/profile')}>Edit Profile</Button>
          <Button onPress={() => router.push('/(main)/settings')}>Basic Settings</Button>
          <Button onPress={confirmLogout}>Log Out</Button>
        </AccountCard>
      </YStack>
    </ScrollView>
  );
}
