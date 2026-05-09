import { Text as TamaguiText, XStack } from 'tamagui';

import { a11yProps, dsMetrics } from './component-utils';

export type ToggleValue = 'off' | 'on' | 'system';

export interface ToggleProps {
  value?: ToggleValue;
  checked?: boolean;
  variant?: 'standard' | 'tristate';
  disabled?: boolean;
  label?: string;
  onValueChange?: (value: ToggleValue) => void;
  onCheckedChange?: (checked: boolean) => void;
}

export function Toggle({
  value,
  checked,
  variant = 'standard',
  disabled = false,
  label = '开关',
  onValueChange,
  onCheckedChange,
}: ToggleProps) {
  const current: ToggleValue = value ?? (checked ? 'on' : 'off');
  const isOn = current === 'on';
  const isSystem = current === 'system';

  function next() {
    if (disabled) return;
    const nextValue: ToggleValue =
      variant === 'tristate' ? (current === 'off' ? 'on' : current === 'on' ? 'system' : 'off') : isOn ? 'off' : 'on';
    onValueChange?.(nextValue);
    onCheckedChange?.(nextValue === 'on');
  }

  return (
    <XStack gap="$2" alignItems="center">
      <XStack
        width={dsMetrics.toggleWidth}
        height={dsMetrics.toggleHeight}
        borderRadius="$full"
        padding={dsMetrics.togglePadding}
        backgroundColor={isOn ? '$brand500' : isSystem ? '$info' : '$neutral200'}
        opacity={disabled ? 0.5 : 1}
        {...a11yProps({ role: 'switch', label, state: { checked: isOn, disabled } })}
        onPress={next}
      >
        <XStack
          width={dsMetrics.toggleThumb}
          height={dsMetrics.toggleThumb}
          borderRadius="$full"
          backgroundColor="$surfacePrimary"
          marginLeft={isOn || isSystem ? dsMetrics.toggleThumbOffset : 0}
        />
      </XStack>
      {variant === 'tristate' && isSystem ? (
        <TamaguiText color="$neutral500" fontSize="$2">
          跟随系统
        </TamaguiText>
      ) : null}
    </XStack>
  );
}
