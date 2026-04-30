import type { Meta, StoryObj } from '@storybook/react';
import { YStack } from 'tamagui';

import { SearchBar } from './search-bar';

const meta = {
  title: 'Components/SearchBar',
  component: SearchBar,
  args: {
    placeholder: '搜索交易',
  },
} satisfies Meta<typeof SearchBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const States: Story = {
  render: () => (
    <YStack gap="$3">
      <SearchBar variant="sticky" defaultValue="咖啡" />
      <SearchBar variant="inline" emptyResult defaultValue="不存在的分类" />
    </YStack>
  ),
};
