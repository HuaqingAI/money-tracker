import type { Meta, StoryObj } from '@storybook/react';
import { XStack } from 'tamagui';

import { FilterChip } from './filter-chip';

const meta = {
  title: 'Components/FilterChip',
  component: FilterChip,
  args: {
    label: '餐饮',
    selected: true,
  },
} satisfies Meta<typeof FilterChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <XStack gap="$2">
      <FilterChip label="餐饮" icon="🍜" selected count={12} />
      <FilterChip label="交通" icon="🚇" />
      <FilterChip label="¥500" variant="amount" />
      <FilterChip label="禁用" disabled />
    </XStack>
  ),
};
