import type { ReactNode } from 'react';
import { Text as TamaguiText, XStack, YStack } from 'tamagui';

import { Badge } from './badge';
import { a11yProps, MaybeIcon } from './component-utils';

export interface BottomTabBarItem {
  key: string;
  label: string;
  icon?: ReactNode;
  accessibilityLabel?: string;
  badge?: boolean | number | string;
  disabled?: boolean;
}

export interface BottomTabBarProps {
  items: BottomTabBarItem[];
  activeKey: string;
  safeAreaBottom?: number;
  onTabPress?: (key: string, item: BottomTabBarItem) => void;
  accessibilityLabel?: string;
}

export function BottomTabBar({
  items,
  activeKey,
  safeAreaBottom = 0,
  onTabPress,
  accessibilityLabel = '底部导航',
}: BottomTabBarProps) {
  function renderBadge(item: BottomTabBarItem) {
    if (!item.badge) return null;
    if (item.badge === true) {
      return <Badge variant="dot" accessibilityLabel={`${item.label}有新内容`} />;
    }
    const numericBadge = typeof item.badge === 'number' ? item.badge : Number(item.badge);
    if (Number.isFinite(numericBadge)) {
      return <Badge variant="counter" count={numericBadge} label={String(item.badge)} />;
    }
    return <Badge variant="label" label={String(item.badge)} accessibilityLabel={`${item.label}${item.badge}`} />;
  }

  return (
    <XStack
      minHeight="$heightTabbar"
      paddingBottom={safeAreaBottom}
      backgroundColor="$surfacePrimary"
      borderTopWidth={1}
      borderTopColor="$neutral100"
      {...a11yProps({ role: 'tablist', label: accessibilityLabel })}
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <YStack
            key={item.key}
            flex={1}
            minHeight="$heightTabbar"
            alignItems="center"
            justifyContent="center"
            gap="$1"
            opacity={item.disabled ? 0.5 : 1}
            {...a11yProps({
              role: 'tab',
              label: item.accessibilityLabel ?? item.label,
              state: { selected: active, disabled: item.disabled },
            })}
            onPress={item.disabled ? undefined : () => onTabPress?.(item.key, item)}
          >
            <XStack position="relative" minWidth={24} minHeight={24} alignItems="center" justifyContent="center">
              <MaybeIcon icon={item.icon} />
              {item.badge ? (
                <XStack position="absolute" right={-8} top={-4}>
                  {renderBadge(item)}
                </XStack>
              ) : null}
            </XStack>
            <TamaguiText
              color={active ? '$brand500' : '$neutral400'}
              fontSize="$11"
              fontWeight={active ? '600' : '500'}
            >
              {item.label}
            </TamaguiText>
          </YStack>
        );
      })}
    </XStack>
  );
}
