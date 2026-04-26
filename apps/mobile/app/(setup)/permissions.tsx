import { Button, Text } from '@money-tracker/ui';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Separator, XStack, YStack } from 'tamagui';

import {
  type AndroidNotificationGuide,
  androidNotificationGuides,
  genericAndroidNotificationGuide,
} from '../../config/android-notification-guides';
import {
  getAndroidDeviceProfile,
  getNotificationPermissionStatus,
  type NotificationPermissionStatus,
  openNotificationListenerSettings,
} from '../../lib/android-notification';
import { useAuthStore } from '../../stores/auth-store';

function resolveGuide(manufacturer: string): AndroidNotificationGuide {
  const normalizedManufacturer = manufacturer.toLowerCase();

  return (
    androidNotificationGuides.find((guide) =>
      guide.matchers.some((matcher) =>
        normalizedManufacturer.includes(matcher.toLowerCase()),
      ),
    ) ?? genericAndroidNotificationGuide
  );
}

export default function PermissionsScreen() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionStatus>('unknown');
  const [manufacturer, setManufacturer] = useState('Android');
  const [model, setModel] = useState('Device');
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    void (async () => {
      const [profile, status] = await Promise.all([
        getAndroidDeviceProfile(),
        getNotificationPermissionStatus(),
      ]);

      setManufacturer(profile.manufacturer);
      setModel(profile.model);
      setPermissionStatus(status);
    })();
  }, []);

  const guide = useMemo(() => resolveGuide(manufacturer), [manufacturer]);

  function completeSetup(): void {
    if (session) {
      setSession({
        ...session,
        user: {
          ...session.user,
          needsOnboarding: false,
        },
      });
    }

    router.replace('/import');
  }

  async function handleOpenSettings(): Promise<void> {
    setOpening(true);

    try {
      await openNotificationListenerSettings();
      const refreshedStatus = await getNotificationPermissionStatus();
      setPermissionStatus(refreshedStatus);
    } finally {
      setOpening(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <YStack flex={1} gap="$5" padding="$4" backgroundColor="$surfacePage">
          <YStack
            gap="$3"
            padding="$5"
            borderRadius="$xl"
            backgroundColor="$surfacePrimary"
          >
            <Text variant="h1">开启自动记账前，需要一个系统权限</Text>
            <Text variant="body">
              打开通知读取后，应用只在本地提取消费金额、商户和时间。原始通知内容不会离开你的手机。
            </Text>
            <Text variant="caption">
              当前状态：{permissionStatus === 'enabled' ? '已开启' : '未开启'}
            </Text>
          </YStack>

          <YStack gap="$3">
            <YStack
              gap="$2"
              padding="$4"
              borderRadius="$lg"
              backgroundColor="$surfacePrimary"
            >
              <Text variant="bodyMedium">安全提取</Text>
              <Text variant="caption">
                只上传结构化账单 JSON，不上传通知原文。
              </Text>
            </YStack>
            <YStack
              gap="$2"
              padding="$4"
              borderRadius="$lg"
              backgroundColor="$surfacePrimary"
            >
              <Text variant="bodyMedium">本地规则识别</Text>
              <Text variant="caption">
                支付宝、微信和常见银行卡通知先在设备侧匹配，再交给后续去重与 AI 分类链路。
              </Text>
            </YStack>
            <YStack
              gap="$2"
              padding="$4"
              borderRadius="$lg"
              backgroundColor="$surfacePrimary"
            >
              <Text variant="bodyMedium">随时可关</Text>
              <Text variant="caption">
                可以在系统设置里关闭授权，已经识别的历史账单不受影响。
              </Text>
            </YStack>
          </YStack>

          <YStack
            gap="$3"
            padding="$5"
            borderRadius="$xl"
            backgroundColor="$surfacePrimary"
          >
            <Text variant="h2">如何开启</Text>
            <Text variant="caption">
              {guide.badgeLabel} · {manufacturer} {model}
            </Text>
            <Separator />
            {guide.steps.map((step, index) => (
              <XStack key={step} gap="$3" alignItems="flex-start">
                <YStack
                  width={28}
                  height={28}
                  borderRadius="$full"
                  justifyContent="center"
                  alignItems="center"
                  backgroundColor="$brand500"
                >
                  <Text variant="small" color="$surfacePrimary">
                    {String(index + 1)}
                  </Text>
                </YStack>
                <YStack flex={1}>
                  <Text variant="body">{step}</Text>
                </YStack>
              </XStack>
            ))}
            {guide.notes.map((note) => (
              <Text key={note} variant="caption">
                {note}
              </Text>
            ))}
          </YStack>

          <YStack gap="$3" marginTop="auto">
            <Button disabled={opening} onPress={() => void handleOpenSettings()}>
              {opening ? '正在打开设置...' : '去开启通知读取'}
            </Button>
            <Button chromeless onPress={completeSetup}>
              稍后设置，进入账单导入
            </Button>
            <Text variant="caption">
              跳过后仍可继续使用账单导入，之后可以从设置页重新开启自动记账。
            </Text>
          </YStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
