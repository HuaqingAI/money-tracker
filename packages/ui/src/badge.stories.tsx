import type { Meta, StoryObj } from '@storybook/react';
import { XStack } from 'tamagui';

import { Badge } from './badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  args: {
    label: 'NEW',
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <XStack gap="$2" alignItems="center">
      <Badge variant="dot" />
      <Badge variant="label" label="固定支出" />
      <Badge variant="tag" label="为自己" selected tone="self" />
      <Badge variant="tag" label="为配偶" tone="spouse" />
      <Badge variant="counter" count={2} label="免费体验 2/3" />
    </XStack>
  ),
};
