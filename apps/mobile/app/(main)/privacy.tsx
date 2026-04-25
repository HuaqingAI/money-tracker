import { Text } from '@money-tracker/ui';
import { ScrollView } from 'react-native';
import { YStack } from 'tamagui';

export default function PrivacyScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <YStack
        backgroundColor="$surfacePrimary"
        borderColor="$neutral200"
        borderRadius="$lg"
        borderWidth={1}
        gap="$3"
        padding="$4"
      >
        <Text variant="h2">隐私协议摘要</Text>
        <Text variant="body">
          了然仅在完成记账和账户服务所需范围内处理个人数据，敏感信息遵循最小化原则存储。
        </Text>
        <Text variant="body">
          你可以在设置页发起删除账户请求，系统将删除账户主体记录，并通过现有外键级联清理关联账务与统计数据。
        </Text>
        <Text variant="body">
          本页面是 MVP 阶段的应用内查看入口；完整协议文本将在后续 Web 隐私页上线后同步接入。
        </Text>
      </YStack>
    </ScrollView>
  );
}
