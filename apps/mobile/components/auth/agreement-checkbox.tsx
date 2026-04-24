import { Text } from '@money-tracker/ui';
import { Pressable } from 'react-native';
import { XStack } from 'tamagui';

interface AgreementCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export function AgreementCheckbox({
  checked,
  onToggle,
  onOpenTerms,
  onOpenPrivacy,
}: AgreementCheckboxProps) {
  return (
    <XStack alignItems="flex-start" gap="$3">
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={onToggle}>
        <XStack
          width={20}
          height={20}
          borderRadius="$md"
          borderColor={checked ? '$brand500' : '$neutral300'}
          borderWidth={1}
          backgroundColor={checked ? '$brand500' : '$surfacePrimary'}
          alignItems="center"
          justifyContent="center"
        >
          {checked ? <Text color="$surfacePrimary">✓</Text> : null}
        </XStack>
      </Pressable>
      <Text variant="caption" flex={1}>
        登录即代表同意{' '}
        <Text variant="caption" color="$brand500" onPress={onOpenTerms}>
          《用户协议》
        </Text>{' '}
        和{' '}
        <Text variant="caption" color="$brand500" onPress={onOpenPrivacy}>
          《隐私政策》
        </Text>
      </Text>
    </XStack>
  );
}
