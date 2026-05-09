import { Separator, XStack } from 'tamagui';

import { a11yProps } from './component-utils';

export interface DividerProps {
  variant?: 'full' | 'inset';
  accessibilityLabel?: string;
}

export function Divider({ variant = 'full', accessibilityLabel = '分隔线' }: DividerProps) {
  return (
    <XStack paddingLeft={variant === 'inset' ? '$8' : 0} {...a11yProps({ label: accessibilityLabel })}>
      <Separator flex={1} borderColor="$neutral100" />
    </XStack>
  );
}
