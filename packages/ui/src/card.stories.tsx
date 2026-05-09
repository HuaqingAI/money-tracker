import type { Meta, StoryObj } from '@storybook/react';
import { YStack } from 'tamagui';

import { Card } from './card';

const meta = {
  title: 'Components/Card',
  component: Card,
  args: {
    title: '月度支出',
    value: '¥3,280',
    subtitle: '比上月下降 8%',
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <YStack gap="$3">
      <Card variant="metric" title="月度支出" value="¥3,280" subtitle="预算内" />
      <Card variant="category" title="餐饮" value="¥860" progress={32} expanded />
      <Card variant="transaction" title="星巴克" subtitle="餐饮 · 今天" value="-¥32" pressable />
      <Card variant="insight" title="外卖支出偏高" badge="NEW" description="本周外卖比上周高 18%，可以考虑设置预算提醒。" />
      <Card variant="empty" title="还没有交易" description="开启通知捕获后，这里会自动出现账单。" />
    </YStack>
  ),
};
