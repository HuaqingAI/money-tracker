import type { Meta, StoryObj } from '@storybook/react';
import { YStack } from 'tamagui';

import { Tooltip } from './tooltip';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: {
    visible: true,
    content: 'AI 会基于你的消费记录生成洞察。',
  },
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <YStack gap="$3">
      <Tooltip variant="info-tip" visible content="AI 会基于你的消费记录生成洞察。" />
      <Tooltip variant="chart-tip" visible content="餐饮 ¥3,280，占比 32%" />
    </YStack>
  ),
};
