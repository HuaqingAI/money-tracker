import { Button, Text } from '@money-tracker/ui';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { YStack } from 'tamagui';

import { getLegalDocument, type LegalDocumentType } from '../../lib/legal-documents';

function resolveDocumentType(value: string | string[] | undefined): LegalDocumentType {
  return value === 'privacy' ? 'privacy' : 'terms';
}

export default function LegalDocumentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string | string[] }>();
  const documentType = resolveDocumentType(params.type);
  const document = getLegalDocument(documentType);

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
            返回
          </Button>
        </YStack>
        <YStack flex={1} marginTop="$2" overflow="hidden">
          <WebView
            originWhitelist={['*']}
            source={{ html: document.html }}
            setSupportMultipleWindows={false}
            startInLoadingState
            renderError={(errorName) => (
              <YStack alignItems="center" flex={1} gap="$3" justifyContent="center" padding="$5">
                <Text variant="h2">页面加载失败</Text>
                <Text variant="body">{errorName}</Text>
              </YStack>
            )}
          />
        </YStack>
      </YStack>
    </SafeAreaView>
  );
}
