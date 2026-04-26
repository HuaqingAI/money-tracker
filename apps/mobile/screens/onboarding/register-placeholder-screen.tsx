import { Text } from '@money-tracker/ui';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

import { GhostTextButton, PrimaryActionButton } from './components';
import { AUTH_ROUTES } from './content';

export function RegisterPlaceholderScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <YStack
        backgroundColor="$surfacePage"
        flex={1}
        gap="$8"
        paddingBottom="$4"
        paddingHorizontal="$4"
        paddingTop="$3"
      >
        <YStack alignItems="flex-start">
          <GhostTextButton
            label="返回欢迎页"
            onPress={() => router.replace(AUTH_ROUTES.welcome)}
          />
        </YStack>

        <YStack flex={1} gap="$5" justifyContent="center">
          <YStack
            backgroundColor="$surfacePrimary"
            borderWidth={1}
            borderColor="$neutral100"
            borderRadius="$xl"
            paddingHorizontal="$4"
            paddingVertical="$4"
          >
            <Text variant="caption" color="$brand500">
              Story 1.1 占位页
            </Text>
          </YStack>

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
