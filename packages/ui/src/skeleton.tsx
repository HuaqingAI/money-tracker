import { useEffect, useState } from 'react';
import { XStack, YStack } from 'tamagui';

import { a11yProps, dsMetrics } from './component-utils';

export type SkeletonVariant = 'card' | 'list-item' | 'chart' | 'text';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  lines?: number;
  pulsing?: boolean;
  accessibilityLabel?: string;
}

function SkeletonBlock({
  width,
  height,
  rounded = '$md',
  opacity,
}: {
  width: number | string;
  height: number;
  rounded?: '$md' | '$lg' | '$full';
  opacity: number;
}) {
  return (
    <YStack
      width={width}
      height={height}
      borderRadius={rounded}
      backgroundColor="$neutral200"
      opacity={opacity}
    />
  );
}

function usePulseOpacity(pulsing: boolean) {
  const [dimmed, setDimmed] = useState(true);
  const testEnvironment = (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT === true;

  useEffect(() => {
    if (!pulsing || testEnvironment) return undefined;
    const timer = globalThis.setInterval(() => setDimmed((current) => !current), 750);
    return () => globalThis.clearInterval(timer);
  }, [pulsing, testEnvironment]);

  if (!pulsing) return 1;
  return dimmed ? 0.72 : 1;
}

export function Skeleton({
  variant = 'text',
  lines = 3,
  pulsing = true,
  accessibilityLabel = '内容加载中',
}: SkeletonProps) {
  const pulseOpacity = usePulseOpacity(pulsing);

  if (variant === 'card') {
    return (
      <YStack
        gap="$3"
        padding="$4"
        borderRadius="$lg"
        backgroundColor="$surfacePrimary"
        {...a11yProps({ label: accessibilityLabel, busy: true })}
      >
        <SkeletonBlock width="45%" height={dsMetrics.skeletonTitleHeight} opacity={pulseOpacity} />
        <SkeletonBlock width="80%" height={dsMetrics.skeletonCardBodyHeight} rounded="$lg" opacity={pulseOpacity} />
        <SkeletonBlock width="65%" height={dsMetrics.skeletonMetaHeight} opacity={pulseOpacity} />
      </YStack>
    );
  }

  if (variant === 'list-item') {
    return (
      <XStack
        height="$heightTransaction"
        gap="$3"
        alignItems="center"
        {...a11yProps({ label: accessibilityLabel, busy: true })}
      >
        <SkeletonBlock width={dsMetrics.skeletonAvatarSize} height={dsMetrics.skeletonAvatarSize} rounded="$full" opacity={pulseOpacity} />
        <YStack flex={1} gap="$2">
          <SkeletonBlock width="58%" height={dsMetrics.skeletonTextLineHeight} opacity={pulseOpacity} />
          <SkeletonBlock width="38%" height={dsMetrics.skeletonMetaHeight} opacity={pulseOpacity} />
        </YStack>
        <SkeletonBlock width={dsMetrics.skeletonAmountWidth} height={dsMetrics.skeletonTitleHeight} opacity={pulseOpacity} />
      </XStack>
    );
  }

  if (variant === 'chart') {
    return (
      <YStack {...a11yProps({ label: accessibilityLabel, busy: true })}>
        <SkeletonBlock width="100%" height={dsMetrics.skeletonChartHeight} rounded="$lg" opacity={pulseOpacity} />
      </YStack>
    );
  }

  return (
    <YStack gap="$2" {...a11yProps({ label: accessibilityLabel, busy: true })}>
      {Array.from({ length: lines }, (_, index) => (
        <SkeletonBlock
          key={index}
          width={index === lines - 1 ? '62%' : '100%'}
          height={dsMetrics.skeletonTextLineHeight}
          opacity={pulseOpacity}
        />
      ))}
    </YStack>
  );
}
