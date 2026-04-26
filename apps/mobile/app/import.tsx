import { Button, Text } from '@money-tracker/ui';
import { useRouter } from 'expo-router';
import { YStack } from 'tamagui';

export default function ImportScreen() {
  const router = useRouter();

  return (
    <YStack
      flex={1}
      gap="$4"
      padding="$4"
      justifyContent="center"
      backgroundColor="$surfacePage"
    >
      <Text variant="h1">账单导入</Text>
      <Text variant="body">
        Story 1.4 会在这里接入支付宝/微信 CSV 导入。当前 Story 1.3 已完成通知权限与捕获链路的前置交付。
      </Text>
      <Button onPress={() => router.replace('/')}>返回首页</Button>
    </YStack>
  );
}
