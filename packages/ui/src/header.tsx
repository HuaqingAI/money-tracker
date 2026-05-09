import type { ReactNode } from 'react';
import { Text as TamaguiText, XStack } from 'tamagui';

import { a11yProps } from './component-utils';

export interface HeaderAction {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  onPress?: () => void;
}

export interface HeaderProps {
  title?: ReactNode;
  variant?: 'root' | 'stack' | 'modal';
  scrolled?: boolean;
  leftAction?: HeaderAction;
  rightActions?: HeaderAction[];
  safeAreaTop?: number;
  accessibilityLabel?: string;
}

function HeaderActionButton({ action }: { action: HeaderAction }) {
  return (
    <XStack
      minWidth={44}
      minHeight={44}
      alignItems="center"
      justifyContent="center"
      opacity={action.disabled ? 0.5 : 1}
      {...a11yProps({ role: 'button', label: action.label, state: { disabled: action.disabled } })}
      onPress={action.disabled ? undefined : action.onPress}
    >
      {action.icon ?? (
        <TamaguiText color="$neutral700" fontSize="$6">
          {action.label}
        </TamaguiText>
      )}
    </XStack>
  );
}

export function Header({
  title,
  variant = 'root',
  scrolled = false,
  leftAction,
  rightActions = [],
  safeAreaTop = 0,
  accessibilityLabel = '页面导航',
}: HeaderProps) {
  const root = variant === 'root';
  return (
    <XStack
      height="$heightHeader"
      paddingTop={safeAreaTop}
      paddingHorizontal="$4"
      alignItems="center"
      backgroundColor="$surfacePrimary"
      borderBottomWidth={scrolled ? 1 : 0}
      borderBottomColor="$neutral100"
      {...a11yProps({ role: 'navigation', label: accessibilityLabel })}
    >
      <XStack width={44}>{leftAction ? <HeaderActionButton action={leftAction} /> : null}</XStack>
      <XStack flex={1} justifyContent={root ? 'flex-start' : 'center'}>
        <TamaguiText
          color="$neutral800"
          fontSize={root ? '$8' : '$7'}
          fontWeight={root ? '700' : '600'}
          numberOfLines={1}
        >
          {title}
        </TamaguiText>
      </XStack>
      <XStack minWidth={44} justifyContent="flex-end">
        {rightActions.map((action) => (
          <HeaderActionButton key={action.key} action={action} />
        ))}
      </XStack>
    </XStack>
  );
}
