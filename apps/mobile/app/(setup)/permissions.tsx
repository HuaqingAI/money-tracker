import { Button, Text } from '@money-tracker/ui';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

export default function PermissionsScreen() {
  const router = useRouter();

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
        <Text variant="h1">下一步：开启自动记账</Text>
        <Text variant="body">开启通知权限后，了然会在本地识别支付通知，只上传结构化账单信息。</Text>
        <Button
          onPress={() => {
            router.replace('/(setup)/bill-import');
          }}
        >
          继续导入历史账单
        </Button>
      </YStack>
    </SafeAreaView>
  );
}
