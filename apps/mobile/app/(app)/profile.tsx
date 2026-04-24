import { Button, Text, TextInput } from '@money-tracker/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView } from 'react-native';
import { YStack } from 'tamagui';

import {
  ApiClientError,
  fetchUserProfile,
  updateProfile,
} from '../../lib/api-client';
import { useAuthStore } from '../../stores/auth-store';

export default function ProfileScreen() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUserProfile = useAuthStore((state) => state.setUserProfile);
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    enabled: !!accessToken,
    queryFn: () => fetchUserProfile(accessToken as string),
    queryKey: ['user-profile'],
  });

  const [nicknameDraft, setNicknameDraft] = useState<string | null>(null);
  const [avatarUrlDraft, setAvatarUrlDraft] = useState<string | null>(null);

  const nickname = nicknameDraft ?? profileQuery.data?.nickname ?? '';
  const avatarUrl = avatarUrlDraft ?? profileQuery.data?.avatarUrl ?? '';

  const mutation = useMutation({
    mutationFn: () =>
      updateProfile(accessToken as string, {
        avatarUrl,
        nickname,
      }),
    onSuccess: (profile) => {
      setUserProfile(profile);
      queryClient.setQueryData(['user-profile'], profile);
      router.back();
    },
  });

  function onSave(): void {
    mutation.mutate(undefined, {
      onError: (error) => {
        const message =
          error instanceof ApiClientError ? error.message : 'Failed to save profile.';
        Alert.alert('Save failed', message);
      },
    });
  }

  if (profileQuery.isLoading) {
    return (
      <YStack alignItems="center" flex={1} justifyContent="center">
        <ActivityIndicator />
      </YStack>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <YStack gap="$4">
        <Text variant="caption">
          This MVP screen supports nickname and avatar URL only.
        </Text>

        <YStack gap="$2">
          <Text variant="bodyMedium">Nickname</Text>
          <TextInput
            onChangeText={setNicknameDraft}
            placeholder="Enter nickname"
            value={nickname}
          />
        </YStack>

        <YStack gap="$2">
          <Text variant="bodyMedium">Avatar URL</Text>
          <TextInput
            onChangeText={setAvatarUrlDraft}
            placeholder="https://example.com/avatar.png"
            value={avatarUrl}
          />
        </YStack>

        <Button onPress={onSave}>
          {mutation.isPending ? 'Saving...' : 'Save Profile'}
        </Button>
      </YStack>
    </ScrollView>
  );
}
