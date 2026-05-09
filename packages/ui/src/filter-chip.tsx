import type { ReactNode } from 'react';
import { Text as TamaguiText, XStack } from 'tamagui';

import { a11yProps, MaybeIcon } from './component-utils';

export interface FilterChipProps {
  label: string;
  variant?: 'filter' | 'amount';
  selected?: boolean;
  count?: number;
  icon?: ReactNode;
  disabled?: boolean;
  accessibilityLabel?: string;
  onPress?: () => void;
}

export function FilterChip({
  label,
  variant = 'filter',
  selected = false,
  count,
  icon,
  disabled = false,
  accessibilityLabel,
  onPress,
}: FilterChipProps) {
  return (
    <XStack
      height="$heightChip"
      paddingHorizontal="$3"
      borderRadius="$full"
      gap="$1"
      alignItems="center"
      backgroundColor={selected ? '$brand500' : '$neutral100'}
      opacity={disabled ? 0.5 : 1}
      {...a11yProps({
        role: 'button',
        label: accessibilityLabel ?? `${variant === 'amount' ? '金额' : '筛选'} ${label}`,
        state: { selected, disabled },
      })}
      onPress={disabled ? undefined : onPress}
    >
      <MaybeIcon icon={icon} />
      <TamaguiText color={selected ? '$surfacePrimary' : '$neutral700'} fontSize="$2" fontWeight="500">
        {label}
      </TamaguiText>
      {count !== undefined ? (
        <TamaguiText color={selected ? '$surfacePrimary' : '$neutral500'} fontSize="$1">
          {count}
        </TamaguiText>
      ) : null}
    </XStack>
  );
}
