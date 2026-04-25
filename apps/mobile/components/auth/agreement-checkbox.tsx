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
    <XStack alignItems="flex-start" gap="$2" justifyContent="center">
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={onToggle}>
        <XStack
          width={22}
          height={22}
          borderRadius={11}
          borderColor={checked ? '$brand500' : '$neutral300'}
          borderWidth={1}
          backgroundColor={checked ? '$brand500' : '$surfacePrimary'}
          alignItems="center"
          justifyContent="center"
          marginTop={2}
        >
          {checked ? <Text color="$surfacePrimary" fontSize="$2">✓</Text> : null}
        </XStack>
      </Pressable>
      <Text variant="small" flex={1} color="$neutral400">
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
