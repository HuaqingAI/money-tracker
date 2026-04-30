import { useEffect, useRef } from 'react';
import { Text as TamaguiText, XStack, YStack } from 'tamagui';

import { a11yProps, clamp, dsMetrics, getPercent } from './component-utils';

export type ProgressVariant = 'dots' | 'bar' | 'counter' | 'circular' | 'inline';
export type ProgressState = 'idle' | 'active' | 'complete' | 'stalled';

export interface ProgressProps {
  variant?: ProgressVariant;
  value?: number;
  min?: number;
  max?: number;
  total?: number;
  label?: string;
  state?: ProgressState;
  steps?: number;
  disableAnimation?: boolean;
  onComplete?: () => void;
}

export function Progress({
  variant = 'bar',
  value = 0,
  min = 0,
  max = 100,
  total,
  label = '进度',
  state = 'active',
  steps = 3,
  disableAnimation = false,
  onComplete,
}: ProgressProps) {
  const normalized = clamp(value, min, max);
  const percent = getPercent(normalized, min, max);
  const completedRef = useRef(false);

  useEffect(() => {
    const complete = normalized >= max && state === 'complete';
    if (!complete) {
      completedRef.current = false;
      return;
    }
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  }, [max, normalized, onComplete, state]);

  if (variant === 'dots') {
    const activeIndex = Math.min(Math.max(Math.round(normalized), 0), steps - 1);
    return (
        <XStack
          gap="$2"
          alignItems="center"
          {...a11yProps({ role: 'progressbar', label, value: { min: 0, max: steps, now: activeIndex + 1 } })}
        >
        {Array.from({ length: steps }, (_, index) => (
          <YStack
            key={index}
            width={index === activeIndex ? dsMetrics.progressDotActive : dsMetrics.progressDot}
            height={index === activeIndex ? dsMetrics.progressDotActive : dsMetrics.progressDot}
            borderRadius="$full"
            backgroundColor={index === activeIndex ? '$brand500' : '$neutral200'}
          />
        ))}
      </XStack>
    );
  }

  if (variant === 'counter') {
    return (
      <TamaguiText
        color={state === 'stalled' ? '$warning' : '$neutral700'}
        fontSize="$3"
        {...a11yProps({ role: 'progressbar', label, value: { min, max, now: normalized } })}
      >
        {label} {normalized}/{total ?? max}
      </TamaguiText>
    );
  }

  if (variant === 'circular') {
    return (
      <YStack
        width={dsMetrics.progressCircularSize}
        height={dsMetrics.progressCircularSize}
        borderRadius="$full"
        borderWidth={dsMetrics.progressCircularBorder}
        borderColor="$neutral100"
        alignItems="center"
        justifyContent="center"
        {...a11yProps({ role: 'progressbar', label, value: { min, max, now: normalized } })}
      >
        <TamaguiText color="$brand500" fontSize="$2" fontWeight="700">
          {Math.round(percent)}%
        </TamaguiText>
      </YStack>
    );
  }

  const bar = (
    <YStack
      flex={1}
      height={dsMetrics.progressBarHeight}
      borderRadius="$full"
      backgroundColor="$neutral100"
      overflow="hidden"
      {...a11yProps({ hidden: true })}
    >
      <YStack
        width={`${percent}%`}
        height="100%"
        borderRadius="$full"
        backgroundColor={state === 'stalled' ? '$warning' : '$brand500'}
        opacity={disableAnimation ? 1 : 0.96}
      />
    </YStack>
  );

  if (variant === 'inline') {
    return (
      <XStack
        gap="$3"
        alignItems="center"
        {...a11yProps({ role: 'progressbar', label, value: { min, max, now: normalized } })}
      >
        <TamaguiText color="$neutral700" fontSize="$2">
          {label}
        </TamaguiText>
        {bar}
        <TamaguiText color="$neutral500" fontSize="$2">
          {Math.round(percent)}%
        </TamaguiText>
      </XStack>
    );
  }

  return (
    <YStack
      gap="$2"
      {...a11yProps({ role: 'progressbar', label, value: { min, max, now: normalized } })}
    >
      {bar}
      {state === 'stalled' ? (
        <TamaguiText color="$warning" fontSize="$2">
          处理中，请稍候
        </TamaguiText>
      ) : null}
    </YStack>
  );
}
