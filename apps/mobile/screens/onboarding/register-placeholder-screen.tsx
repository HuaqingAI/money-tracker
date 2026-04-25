import { Text } from '@money-tracker/ui';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, YStack } from 'tamagui';

import { GhostTextButton, PrimaryActionButton } from './components';
import { AUTH_ROUTES } from './content';

export function RegisterPlaceholderScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <YStack flex={1} bg="$surfacePage" px="$4" pt="$3" pb="$4" gap="$8">
        <Stack ai="flex-start">
          <GhostTextButton
            label="返回欢迎页"
            onPress={() => router.replace(AUTH_ROUTES.welcome)}
          />
        </Stack>

        <YStack flex={1} jc="center" gap="$5">
          <Stack
            px="$4"
            py="$4"
            br="$xl"
            bg="$surfacePrimary"
            borderWidth={1}
            borderColor="$neutral100"
          >
            <Text variant="caption" color="$brand500">
              Story 1.1 占位页
            </Text>
          </Stack>

          <YStack gap="$3">
            <Text variant="h1" color="$neutral900" lineHeight={32}>
              注册 / 登录将在这里继续
            </Text>
            <Text variant="body" color="$neutral500" lineHeight={24}>
              Story 1.2 会在这个路由上实现微信 OAuth、手机号 OTP 与隐私协议确认。
              当前页只负责承接欢迎页与引导页的导航链路。
            </Text>
          </YStack>
        </YStack>

        <PrimaryActionButton
          label="重新查看引导"
          onPress={() => router.replace(AUTH_ROUTES.onboarding)}
        />
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
