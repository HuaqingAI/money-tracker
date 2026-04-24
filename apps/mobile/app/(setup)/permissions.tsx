import { AUTH_ROUTE_PATHS } from '@money-tracker/shared';
import { Button, Text } from '@money-tracker/ui';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

import { useAuthStore } from '../../stores/auth-store';

export default function PermissionsScreen() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);

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
            if (session) {
              setSession({
                ...session,
                user: {
                  ...session.user,
                  needsOnboarding: false,
                },
              });
            }
            router.replace(AUTH_ROUTE_PATHS.dashboard);
          }}
        >
          我知道了，进入 Dashboard
        </Button>
      </YStack>
    </SafeAreaView>
  );
}
