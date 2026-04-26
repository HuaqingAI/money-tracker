import { Button, Text } from '@money-tracker/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

import { useAuthStore } from '../../stores/auth-store';

function readParam(value: string | string[] | undefined, fallback = '0'): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

export default function ImportProcessingScreen() {
  const params = useLocalSearchParams();
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const totalCount = readParam(params.totalCount);
  const importedCount = readParam(params.importedCount);
  const duplicateCount = readParam(params.duplicateCount);
  const failedCount = readParam(params.failedCount);

  const completeOnboarding = () => {
    if (session) {
      setSession({
        ...session,
        user: {
          ...session.user,
          needsOnboarding: false,
        },
      });
    }
  };

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
        <Text variant="h1">账单已导入</Text>
        <Text variant="body">
          已读取 {totalCount} 条记录，新增 {importedCount} 条，跳过重复 {duplicateCount} 条，未导入 {failedCount} 条。
        </Text>
        <Text variant="caption">
          下一步会进入智能分类与确认流程，当前先把导入结果保存在待确认列表中。
        </Text>
        <Button
          onPress={() => {
            completeOnboarding();
            router.replace('/(main)/dashboard');
          }}
        >
          进入 Dashboard
        </Button>
      </YStack>
    </SafeAreaView>
  );
}
