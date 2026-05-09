import { useState } from 'react';
import { Text as TamaguiText, XStack, YStack } from 'tamagui';

import { a11yProps, dsMetrics } from './component-utils';

export interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TabProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  variant?: 'segment' | 'mode';
  accessibilityLabel?: string;
  onValueChange?: (value: string) => void;
}

export function Tab({
  items,
  value,
  defaultValue,
  variant = 'segment',
  accessibilityLabel = '页面内切换',
  onValueChange,
}: TabProps) {
  const firstEnabled = items.find((item) => !item.disabled)?.value;
  const [internalValue, setInternalValue] = useState(defaultValue ?? firstEnabled ?? '');
  const activeValue = value ?? internalValue;

  function select(nextValue: string, disabled?: boolean) {
    if (disabled) return;
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  }

  function move(delta: 1 | -1) {
    const enabledItems = items.filter((item) => !item.disabled);
    if (enabledItems.length === 0) return;
    const currentIndex = Math.max(0, enabledItems.findIndex((item) => item.value === activeValue));
    const nextIndex = (currentIndex + delta + enabledItems.length) % enabledItems.length;
    const nextItem = enabledItems[nextIndex];
    if (nextItem) select(nextItem.value);
  }

  function handleKeyPress(event: { key?: string; preventDefault?: () => void }) {
    const key = event.key;
    if (key === 'ArrowRight') {
      event.preventDefault?.();
      move(1);
    }
    if (key === 'ArrowLeft') {
      event.preventDefault?.();
      move(-1);
    }
  }
  const keyboardProps = { onKeyDown: handleKeyPress };

  return (
    <XStack
      height="$heightTab"
      backgroundColor={variant === 'mode' ? '$neutral100' : '$surfacePrimary'}
      borderRadius={variant === 'mode' ? '$lg' : 0}
      padding={variant === 'mode' ? '$1' : 0}
      {...a11yProps({ role: 'tablist', label: accessibilityLabel })}
      {...keyboardProps}
    >
      {items.map((item) => {
        const active = item.value === activeValue;
        return (
          <YStack
            key={item.value}
            flex={1}
            alignItems="center"
            justifyContent="center"
            borderRadius={variant === 'mode' ? '$md' : 0}
            backgroundColor={variant === 'mode' && active ? '$surfacePrimary' : 'transparent'}
            opacity={item.disabled ? 0.5 : 1}
            {...a11yProps({
              role: 'tab',
              label: item.label,
              state: { selected: active, disabled: item.disabled },
            })}
            onPress={() => select(item.value, item.disabled)}
          >
            <TamaguiText color={active ? '$brand500' : '$neutral500'} fontSize="$5" fontWeight={active ? '600' : '400'}>
              {item.label}
            </TamaguiText>
            {variant === 'segment' && active ? (
              <YStack
                position="absolute"
                bottom={0}
                height={dsMetrics.tabIndicatorHeight}
                width="40%"
                borderRadius="$full"
                backgroundColor="$brand500"
              />
            ) : null}
          </YStack>
        );
      })}
    </XStack>
  );
}
