import { Text } from '@money-tracker/ui';
import { Pressable, StyleSheet } from 'react-native';
import { XStack, YStack } from 'tamagui';

import type { BillingImportSource } from './types';

interface BillImportSourceCardProps {
  active: boolean;
  description: string;
  label: string;
  onPress: () => void;
  source: BillingImportSource;
}

const sourceBadge: Record<BillingImportSource, string> = {
  alipay: '支',
  wechat: '微',
};

export function BillImportSourceCard({
  active,
  description,
  label,
  onPress,
  source,
}: BillImportSourceCardProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        active ? styles.activeCard : undefined,
        pressed ? styles.pressed : undefined,
      ]}
    >
      <XStack alignItems="center" gap="$3">
        <YStack
          alignItems="center"
          backgroundColor={active ? '$brand500' : '$neutral100'}
          borderRadius="$md"
          height={40}
          justifyContent="center"
          width={40}
        >
          <Text color={active ? '$surfacePrimary' : '$neutral700'} fontWeight="700">
            {sourceBadge[source]}
          </Text>
        </YStack>
        <YStack flex={1} gap="$1">
          <Text variant="bodyMedium">{label}</Text>
          <Text variant="caption">{description}</Text>
        </YStack>
      </XStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  activeCard: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  pressed: {
    opacity: 0.82,
  },
});

