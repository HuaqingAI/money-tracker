import { Button, Text } from '@money-tracker/ui';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { YStack } from 'tamagui';

import { getLegalDocument } from '../../lib/legal-documents';

export default function PrivacyScreen() {
  const router = useRouter();
  const document = getLegalDocument('privacy');

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: document.title,
          headerShown: true,
        }}
      />
      <YStack flex={1} backgroundColor="$surfacePage">
        <YStack paddingHorizontal="$4" paddingTop="$3">
          <Button alignSelf="flex-start" size="$3" onPress={() => router.back()}>
            Back
          </Button>
        </YStack>
        <YStack flex={1} marginTop="$2" overflow="hidden">
          <WebView
            originWhitelist={['*']}
            renderError={(errorName) => (
              <YStack alignItems="center" flex={1} gap="$3" justifyContent="center" padding="$5">
                <Text variant="h2">Page failed to load</Text>
                <Text variant="body">{errorName}</Text>
              </YStack>
            )}
            setSupportMultipleWindows={false}
            source={{ html: document.html }}
            startInLoadingState
          />
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}
