import { useEffect, useMemo, useRef, useState } from 'react';
import { Input, Text as TamaguiText, XStack, YStack } from 'tamagui';

import { a11yProps, dsMetrics } from './component-utils';

export interface SearchBarProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  variant?: 'sticky' | 'inline';
  debounceMs?: number;
  emptyResult?: boolean;
  emptyResultLabel?: string;
  accessibilityLabel?: string;
  onChangeText?: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  onClear?: () => void;
}

export function SearchBar({
  value,
  defaultValue = '',
  placeholder = '搜索',
  variant = 'inline',
  debounceMs = 300,
  emptyResult = false,
  emptyResultLabel = '没有找到相关结果',
  accessibilityLabel = '搜索',
  onChangeText,
  onDebouncedChange,
  onClear,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentValue = value ?? internalValue;
  const filled = currentValue.length > 0;

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const clear = useMemo(
    () => () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (value === undefined) setInternalValue('');
      onChangeText?.('');
      onDebouncedChange?.('');
      onClear?.();
    },
    [onChangeText, onClear, onDebouncedChange, value],
  );

  function change(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue);
    onChangeText?.(nextValue);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => onDebouncedChange?.(nextValue), debounceMs);
  }

  return (
    <YStack gap="$2">
      <XStack
        height="$heightSearch"
        paddingHorizontal="$3"
        borderRadius="$full"
        gap="$2"
        alignItems="center"
        backgroundColor="$neutral100"
        borderWidth={variant === 'sticky' ? 1 : 0}
        borderColor="$neutral200"
        {...a11yProps({ label: accessibilityLabel })}
      >
        <TamaguiText color="$neutral400" fontSize="$4">
          搜
        </TamaguiText>
        <Input
          flex={1}
          unstyled
          value={currentValue}
          placeholder={placeholder}
          placeholderTextColor="$neutral400"
          color="$neutral700"
          fontSize="$3"
          {...a11yProps({ label: `${accessibilityLabel}输入` })}
          onChangeText={change}
        />
        {filled ? (
          <XStack
            width={dsMetrics.searchClearButton}
            height={dsMetrics.searchClearButton}
            borderRadius="$full"
            alignItems="center"
            justifyContent="center"
            {...a11yProps({ role: 'button', label: '清空搜索' })}
            onPress={clear}
          >
            <TamaguiText color="$neutral500" fontSize="$3">
              ×
            </TamaguiText>
          </XStack>
        ) : null}
      </XStack>
      {emptyResult ? (
        <TamaguiText color="$neutral500" fontSize="$2" {...a11yProps({ role: 'text' })}>
          {emptyResultLabel}
        </TamaguiText>
      ) : null}
    </YStack>
  );
}
