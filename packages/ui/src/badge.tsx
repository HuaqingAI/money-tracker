import { Text as TamaguiText, XStack } from 'tamagui';

import { a11yProps, type DsTone, toneColorTokens } from './component-utils';

export type BadgeVariant = 'dot' | 'label' | 'tag' | 'counter';

export interface BadgeProps {
  variant?: BadgeVariant;
  label?: string;
  count?: number;
  selected?: boolean;
  tone?: DsTone;
  hidden?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  onPress?: () => void;
}

export function Badge({
  variant = 'label',
  label,
  count,
  selected = false,
  tone = 'brand',
  hidden = false,
  disabled = false,
  accessibilityLabel,
  onPress,
}: BadgeProps) {
  if (hidden) return null;
  const safeCount = typeof count === 'number' && Number.isFinite(count) ? count : undefined;
  const content = variant === 'counter' ? String(safeCount ?? label ?? 0) : label;
  const isTag = variant === 'tag';
  const backgroundColor = isTag && !selected ? 'transparent' : toneColorTokens[tone];
  const textColor = isTag && !selected ? '$neutral500' : '$surfacePrimary';

  if (variant === 'dot') {
    return (
      <XStack
        width={8}
        height={8}
        borderRadius="$full"
        backgroundColor="$error"
        {...a11yProps({ role: 'status', label: accessibilityLabel ?? label ?? '未读提示' })}
      />
    );
  }

  return (
    <XStack
      minHeight={isTag ? 28 : 18}
      paddingHorizontal={isTag ? '$3' : '$2'}
      borderRadius={isTag ? '$full' : '$sm'}
      backgroundColor={variant === 'counter' ? '$neutral100' : backgroundColor}
      borderWidth={isTag && !selected ? 1 : 0}
      borderColor="$neutral300"
      alignItems="center"
      justifyContent="center"
      opacity={disabled ? 0.5 : 1}
      {...a11yProps({
        role: isTag ? 'checkbox' : 'status',
        label: accessibilityLabel ?? content ?? '标签',
        state: isTag ? { checked: selected, disabled } : { disabled },
      })}
      onPress={disabled ? undefined : onPress}
    >
      <TamaguiText
        color={variant === 'counter' ? '$neutral600' : textColor}
        fontSize={isTag ? '$2' : '$10'}
        fontWeight={isTag ? (selected ? '500' : '400') : '700'}
      >
        {content}
      </TamaguiText>
    </XStack>
  );
}
