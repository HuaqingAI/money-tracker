import type { Meta, StoryObj } from '@storybook/react';
import { YStack } from 'tamagui';

import { Text } from './text';

const meta = {
  title: 'Components/Text',
  component: Text,
  args: {
    children: '正文文本',
  },
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <YStack gap="$2">
      <Text variant="h1">一级标题</Text>
      <Text variant="h2">二级标题</Text>
      <Text variant="body">正文文本</Text>
      <Text variant="caption">辅助说明</Text>
      <Text variant="metric">¥3,280</Text>
    </YStack>
  ),
};
