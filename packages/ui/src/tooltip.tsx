import type { ReactNode } from 'react';
import { useState } from 'react';
import { Text as TamaguiText, XStack, YStack } from 'tamagui';

import { shadows } from '../tamagui.config';
import { a11yProps, dsMetrics } from './component-utils';

export interface TooltipProps {
  variant?: 'chart-tip' | 'info-tip';
  visible?: boolean;
  defaultVisible?: boolean;
  content: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  trigger?: ReactNode;
  accessibilityLabel?: string;
  onDismiss?: () => void;
  onVisibleChange?: (visible: boolean) => void;
}

export function Tooltip({
  variant = 'info-tip',
  visible,
  defaultVisible = false,
  content,
  placement = 'auto',
  trigger,
  accessibilityLabel = '提示',
  onDismiss,
  onVisibleChange,
}: TooltipProps) {
  const [internalVisible, setInternalVisible] = useState(defaultVisible);
  const chartTip = variant === 'chart-tip';
  const isControlled = visible !== undefined;
  const open = visible ?? internalVisible;
  const resolvedPlacement = placement === 'auto' ? 'top' : placement;

  function setOpen(nextVisible: boolean) {
    if (!isControlled) setInternalVisible(nextVisible);
    onVisibleChange?.(nextVisible);
    if (!nextVisible) onDismiss?.();
  }

  function handleKeyPress(event: { key?: string }) {
    const key = event.key;
    if (key === 'Escape') setOpen(false);
  }
  const keyboardProps = { onKeyDown: handleKeyPress };

  const placementProps =
    resolvedPlacement === 'bottom'
      ? { top: '100%', marginTop: '$2' }
      : resolvedPlacement === 'left'
        ? { right: '100%', marginRight: '$2' }
        : resolvedPlacement === 'right'
          ? { left: '100%', marginLeft: '$2' }
          : { bottom: '100%', marginBottom: '$2' };

  return (
    <YStack alignSelf="flex-start" gap="$2" position="relative" {...keyboardProps}>
      {trigger ? (
        <XStack {...a11yProps({ role: 'button', label: accessibilityLabel, state: { expanded: open } })} onPress={() => setOpen(!open)}>
          {trigger}
        </XStack>
      ) : null}
      {open ? (
        <YStack
          position={trigger ? 'absolute' : 'relative'}
          zIndex={dsMetrics.tooltipZIndex}
          maxWidth={chartTip ? dsMetrics.tooltipChartWidth : dsMetrics.tooltipInfoWidth}
          paddingHorizontal={chartTip ? '$3' : '$4'}
          paddingVertical={chartTip ? '$2' : '$3'}
          borderRadius={chartTip ? '$md' : '$lg'}
          backgroundColor={chartTip ? '$neutral900' : '$surfacePrimary'}
          borderWidth={chartTip ? 0 : 1}
          borderColor="$neutral200"
          {...placementProps}
          {...a11yProps({ role: 'tooltip', label: `${accessibilityLabel} ${resolvedPlacement}` })}
          {...(chartTip ? shadows.md : shadows.lg)}
        >
          {typeof content === 'string' ? (
            <TamaguiText color={chartTip ? '$surfacePrimary' : '$neutral700'} fontSize="$2" fontWeight={chartTip ? '500' : '400'}>
              {content}
            </TamaguiText>
          ) : (
            content
          )}
        </YStack>
      ) : null}
    </YStack>
  );
}
